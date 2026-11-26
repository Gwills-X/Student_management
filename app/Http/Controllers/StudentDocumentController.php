<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\StudentDocument;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Student document management (Stage 5). Reuses the secure private-storage
 * conventions established for admission and employee documents: files live on
 * the private 'local' disk, per-student folders, with uploader metadata.
 */
class StudentDocumentController extends Controller
{
    private const VALID_TYPES = [
        'Updated Passport Photograph',
        'Transfer Certificate',
        'Medical Report',
        'Birth Certificate',
        'Identification',
        'Other',
    ];

    public function store(Request $request, Student $student): RedirectResponse
    {
        $this->authorize('manageDocuments', $student);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'document_type' => ['required', 'string', 'in:' . implode(',', self::VALID_TYPES)],
            'document_file' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png,webp', 'max:10240'],
        ]);

        $file = $request->file('document_file');
        $path = $file->store("student_documents/{$student->id}", 'local');

        $student->documents()->create([
            'title' => $validated['title'],
            'document_type' => $validated['document_type'],
            'file_path' => $path,
            'file_name' => $file->getClientOriginalName(),
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
            'uploaded_by' => $request->user()->id,
        ]);

        return back()->with('success', 'Student document uploaded successfully.');
    }

    public function view(Student $student, StudentDocument $document): BinaryFileResponse
    {
        $this->authorize('viewDocuments', $student);
        $this->ensureOwnership($student, $document);

        $disk = Storage::disk('local');
        if (! $disk->exists($document->file_path)) {
            abort(404, 'File not found.');
        }

        return response()->file($disk->path($document->file_path), [
            'Content-Type' => $document->mime_type,
            'Content-Disposition' => 'inline; filename="' . addcslashes($document->file_name, '"') . '"',
        ]);
    }

    public function download(Student $student, StudentDocument $document): StreamedResponse
    {
        $this->authorize('viewDocuments', $student);
        $this->ensureOwnership($student, $document);

        if (! Storage::disk('local')->exists($document->file_path)) {
            abort(404, 'File not found.');
        }

        return Storage::disk('local')->download($document->file_path, $document->file_name);
    }

    public function destroy(Student $student, StudentDocument $document): RedirectResponse
    {
        $this->authorize('manageDocuments', $student);
        $this->ensureOwnership($student, $document);

        Storage::disk('local')->delete($document->file_path);
        $document->delete();

        return back()->with('success', 'Student document removed successfully.');
    }

    private function ensureOwnership(Student $student, StudentDocument $document): void
    {
        if ($document->student_id !== $student->id) {
            abort(404);
        }
    }
}
