<?php

namespace App\Services;

use App\Models\AcademicSession;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\StudentEnrolment;
use App\Models\StudentStatusHistory;
use App\Models\StudentTransferHistory;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;
use RuntimeException;

/**
 * Student enrolment domain service (Stage 5).
 *
 * Rules enforced here:
 * - One active enrolment per student per academic session.
 * - No duplicate enrolments per student per session.
 * - The class must belong to the selected academic session.
 * - Class must be active and available for enrolment.
 * - Class level / stage consistency with the class.
 * - Previous enrolments are never overwritten; transfers create records.
 */
class StudentEnrolmentService
{
    /**
     * Enrol a student into an actual class for an academic session.
     */
    public function enrol(Student $student, array $data): StudentEnrolment
    {
        return DB::transaction(function () use ($student, $data) {
            $sessionId = (int) ($data['academic_session_id'] ?? 0);
            $classId = (int) ($data['class_id'] ?? 0);

            $session = AcademicSession::findOrFail($sessionId);
            $class = SchoolClass::whereKey($classId)
                ->where('academic_session_id', $sessionId)
                ->lockForUpdate()
                ->first();

            if (! $class) {
                throw new InvalidArgumentException('The selected class does not belong to the selected academic session.');
            }

            if (! $class->is_active) {
                throw new InvalidArgumentException('The selected class is not active and cannot accept enrolments.');
            }

            $existing = StudentEnrolment::where('student_id', $student->id)
                ->where('academic_session_id', $sessionId)
                ->lockForUpdate()
                ->first();

            if ($existing) {
                throw new InvalidArgumentException(
                    $existing->status === 'Active'
                        ? 'The student already has an active enrolment in this academic session.'
                        : 'The student already has an enrolment record in this academic session.'
                );
            }

            $enrolment = StudentEnrolment::create([
                'student_id' => $student->id,
                'academic_session_id' => $sessionId,
                'class_id' => $class->id,
                'class_level_id' => $class->class_level_id,
                'education_stage_id' => $class->classLevel->education_stage_id,
                'enrolment_date' => $data['enrolment_date'] ?? now()->toDateString(),
                'status' => 'Active',
                'remarks' => $data['remarks'] ?? null,
                'enrolled_by' => $data['enrolled_by'] ?? null,
            ]);

            // Progression into a new session completes the student's Active
            // enrolment in any previous session. Previous records are never
            // deleted or silently overwritten.
            StudentEnrolment::where('student_id', $student->id)
                ->whereKeyNot($enrolment->id)
                ->where('status', 'Active')
                ->each(function (StudentEnrolment $previous) {
                    $previous->update([
                        'status' => 'Completed',
                        'completed_date' => now()->toDateString(),
                        'remarks' => trim(($previous->remarks ? $previous->remarks . ' ' : '') .
                            'Completed upon enrolment into a new academic session.'),
                    ]);
                });

            return $enrolment;
        });
    }

    /**
     * Transfer a student between actual classes within the same session.
     * The previous enrolment is preserved as history (status Transferred).
     */
    public function transfer(Student $student, array $data): StudentTransferHistory
    {
        return DB::transaction(function () use ($student, $data) {
            $sessionId = (int) $data['academic_session_id'];
            $toClassId = (int) $data['to_class_id'];

            $toClass = SchoolClass::whereKey($toClassId)
                ->where('academic_session_id', $sessionId)
                ->lockForUpdate()
                ->first();

            if (! $toClass) {
                throw new InvalidArgumentException('The destination class does not belong to the selected academic session.');
            }

            if (! $toClass->is_active) {
                throw new InvalidArgumentException('The destination class is not active.');
            }

            $enrolment = StudentEnrolment::where('student_id', $student->id)
                ->where('academic_session_id', $sessionId)
                ->lockForUpdate()
                ->first();

            if (! $enrolment) {
                throw new InvalidArgumentException('The student has no enrolment in this academic session to transfer.');
            }

            if ($enrolment->class_id === $toClass->id) {
                throw new InvalidArgumentException('The student is already enrolled in the destination class.');
            }

            $fromClassId = $enrolment->class_id;

            $enrolment->update([
                'class_id' => $toClass->id,
                'class_level_id' => $toClass->class_level_id,
                'education_stage_id' => $toClass->classLevel->education_stage_id,
                'remarks' => $enrolment->remarks
                    ? $enrolment->remarks . "\nTransferred: " . ($data['reason'] ?? 'Class transfer.')
                    : 'Transferred: ' . ($data['reason'] ?? 'Class transfer.'),
            ]);

            return StudentTransferHistory::create([
                'student_id' => $student->id,
                'from_class_id' => $fromClassId,
                'to_class_id' => $toClass->id,
                'academic_session_id' => $sessionId,
                'transfer_date' => $data['transfer_date'] ?? now()->toDateString(),
                'reason' => $data['reason'] ?? null,
                'transferred_by' => $data['transferred_by'] ?? null,
            ]);
        });
    }

    /**
     * Enrol a student into a new academic session (progression). The previous
     * session's enrolment is completed, never deleted.
     */
    public function progressToSession(Student $student, array $data): StudentEnrolment
    {
        return DB::transaction(function () use ($student, $data) {
            $previousSessionId = (int) $data['from_academic_session_id'];
            $newSessionId = (int) $data['academic_session_id'];

            if ($previousSessionId === $newSessionId) {
                throw new InvalidArgumentException('The new session must differ from the previous session.');
            }

            $enrolment = $this->enrol($student, $data);

            StudentEnrolment::where('student_id', $student->id)
                ->where('academic_session_id', $previousSessionId)
                ->where('status', 'Active')
                ->each(function (StudentEnrolment $previous) use ($data) {
                    $previous->update([
                        'status' => 'Completed',
                        'completed_date' => $data['completed_date'] ?? now()->toDateString(),
                        'remarks' => trim(($previous->remarks ? $previous->remarks . ' ' : '') .
                            'Completed upon progression to ' . ($data['completed_remark_session'] ?? 'the next session') . '.'),
                    ]);
                });

            return $enrolment;
        });
    }

    /**
     * Bulk progression for multiple students into a new session.
     * Each student is validated independently; valid students are enrolled,
     * invalid ones are collected as failures and reported.
     */
    public function bulkProgress(array $studentIds, array $data, $staff): array
    {
        $results = [
            'enrolled' => [],
            'failed' => [],
        ];

        foreach ($studentIds as $studentId) {
            $student = Student::find($studentId);

            if (! $student) {
                $results['failed'][] = ['student_id' => $studentId, 'error' => 'Student record not found.'];
                continue;
            }

            try {
                $this->progressToSession($student, array_merge($data, [
                    'enrolled_by' => $staff->id,
                ]));
                $results['enrolled'][] = $student->id;
            } catch (InvalidArgumentException|RuntimeException $e) {
                $results['failed'][] = [
                    'student_id' => $studentId,
                    'name' => $student->full_name,
                    'error' => $e->getMessage(),
                ];
            }
        }

        return $results;
    }

    /**
     * Change the student's lifecycle status with a recorded history entry.
     */
    public function changeStatus(Student $student, string $toStatus, ?string $remarks, $staff): void
    {
        if (! in_array($toStatus, Student::STATUSES, true)) {
            throw new InvalidArgumentException('Invalid student status.');
        }

        DB::transaction(function () use ($student, $toStatus, $remarks, $staff) {
            $from = $student->status;

            $student->update([
                'status' => $toStatus,
                'updated_by' => $staff->id,
            ]);

            StudentStatusHistory::create([
                'student_id' => $student->id,
                'from_status' => $from,
                'to_status' => $toStatus,
                'remarks' => $remarks,
                'changed_by' => $staff->id,
                'changed_at' => now(),
            ]);
        });
    }
}
