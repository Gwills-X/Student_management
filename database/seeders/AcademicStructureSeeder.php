<?php

namespace Database\Seeders;

use App\Models\AcademicSession;
use App\Models\AcademicTerm;
use App\Models\ClassLevel;
use App\Models\EducationStage;
use App\Models\Subject;
use Illuminate\Database\Seeder;

class AcademicStructureSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // ── 1. Education Stages ─────────────────────────────────────────────
        $stagesData = [
            [
                'name' => 'Kindergarten',
                'code' => 'KG',
                'description' => 'Early childhood pre-primary foundational learning stage.',
                'display_order' => 1,
            ],
            [
                'name' => 'Primary',
                'code' => 'PRI',
                'description' => 'Elementary basic education (Grades 1 through 6).',
                'display_order' => 2,
            ],
            [
                'name' => 'Junior Secondary',
                'code' => 'JSS',
                'description' => 'Lower secondary education preparing students for basic certificate examinations.',
                'display_order' => 3,
            ],
            [
                'name' => 'Senior Secondary',
                'code' => 'SSS',
                'description' => 'Upper secondary education preparing students for senior school certificate examinations.',
                'display_order' => 4,
            ],
        ];

        $stageModels = [];
        foreach ($stagesData as $stage) {
            $stageModels[$stage['code']] = EducationStage::firstOrCreate(
                ['code' => $stage['code']],
                [
                    'name' => $stage['name'],
                    'description' => $stage['description'],
                    'display_order' => $stage['display_order'],
                    'is_active' => true,
                ]
            );
        }

        // ── 2. Class Levels ─────────────────────────────────────────────────
        $levelsData = [
            // Kindergarten
            ['stage' => 'KG', 'name' => 'KG 1', 'code' => 'KG1', 'order' => 1, 'desc' => 'Kindergarten 1'],
            ['stage' => 'KG', 'name' => 'KG 2', 'code' => 'KG2', 'order' => 2, 'desc' => 'Kindergarten 2'],

            // Primary
            ['stage' => 'PRI', 'name' => 'Primary 1', 'code' => 'PRI1', 'order' => 3, 'desc' => 'Basic 1'],
            ['stage' => 'PRI', 'name' => 'Primary 2', 'code' => 'PRI2', 'order' => 4, 'desc' => 'Basic 2'],
            ['stage' => 'PRI', 'name' => 'Primary 3', 'code' => 'PRI3', 'order' => 5, 'desc' => 'Basic 3'],
            ['stage' => 'PRI', 'name' => 'Primary 4', 'code' => 'PRI4', 'order' => 6, 'desc' => 'Basic 4'],
            ['stage' => 'PRI', 'name' => 'Primary 5', 'code' => 'PRI5', 'order' => 7, 'desc' => 'Basic 5'],
            ['stage' => 'PRI', 'name' => 'Primary 6', 'code' => 'PRI6', 'order' => 8, 'desc' => 'Basic 6'],

            // Junior Secondary
            ['stage' => 'JSS', 'name' => 'JSS 1', 'code' => 'JSS1', 'order' => 9, 'desc' => 'Junior Secondary School 1'],
            ['stage' => 'JSS', 'name' => 'JSS 2', 'code' => 'JSS2', 'order' => 10, 'desc' => 'Junior Secondary School 2'],
            ['stage' => 'JSS', 'name' => 'JSS 3', 'code' => 'JSS3', 'order' => 11, 'desc' => 'Junior Secondary School 3'],

            // Senior Secondary
            ['stage' => 'SSS', 'name' => 'SS 1', 'code' => 'SS1', 'order' => 12, 'desc' => 'Senior Secondary School 1'],
            ['stage' => 'SSS', 'name' => 'SS 2', 'code' => 'SS2', 'order' => 13, 'desc' => 'Senior Secondary School 2'],
            ['stage' => 'SSS', 'name' => 'SS 3', 'code' => 'SS3', 'order' => 14, 'desc' => 'Senior Secondary School 3'],
        ];

        foreach ($levelsData as $level) {
            $stage = $stageModels[$level['stage']];
            ClassLevel::firstOrCreate(
                [
                    'education_stage_id' => $stage->id,
                    'code' => $level['code'],
                ],
                [
                    'name' => $level['name'],
                    'progression_order' => $level['order'],
                    'description' => $level['desc'],
                    'is_active' => true,
                ]
            );
        }

        // ── 3. Subjects & Stage Mapping ─────────────────────────────────────
        $subjectsData = [
            [
                'name' => 'Mathematics',
                'code' => 'MTH',
                'desc' => 'General mathematics covering numeracy, algebra, geometry, and statistics.',
                'stages' => ['KG', 'PRI', 'JSS', 'SSS'],
            ],
            [
                'name' => 'English Language',
                'code' => 'ENG',
                'desc' => 'English grammar, vocabulary, reading comprehension, and creative composition.',
                'stages' => ['KG', 'PRI', 'JSS', 'SSS'],
            ],
            [
                'name' => 'Basic Science',
                'code' => 'BSC',
                'desc' => 'Integrated introductory natural and physical sciences.',
                'stages' => ['PRI', 'JSS'],
            ],
            [
                'name' => 'Basic Technology',
                'code' => 'BTECH',
                'desc' => 'Introductory technical drawing, materials, tools, and basic mechanics.',
                'stages' => ['JSS'],
            ],
            [
                'name' => 'Social Studies',
                'code' => 'SOS',
                'desc' => 'Civic environment, human relationships, community living, and culture.',
                'stages' => ['PRI', 'JSS'],
            ],
            [
                'name' => 'Civic Education',
                'code' => 'CVE',
                'desc' => 'National values, rights, duties, democratic governance, and citizenship.',
                'stages' => ['PRI', 'JSS', 'SSS'],
            ],
            [
                'name' => 'Computer Studies / ICT',
                'code' => 'ICT',
                'desc' => 'Information and communications technology, digital literacy, and computing.',
                'stages' => ['PRI', 'JSS', 'SSS'],
            ],
            [
                'name' => 'Biology',
                'code' => 'BIO',
                'desc' => 'Study of living organisms, ecology, genetics, and physiology.',
                'stages' => ['SSS'],
            ],
            [
                'name' => 'Chemistry',
                'code' => 'CHM',
                'desc' => 'Study of matter, atomic structure, chemical reactions, and compounds.',
                'stages' => ['SSS'],
            ],
            [
                'name' => 'Physics',
                'code' => 'PHY',
                'desc' => 'Mechanics, heat, light, electricity, magnetism, and atomic physics.',
                'stages' => ['SSS'],
            ],
            [
                'name' => 'Economics',
                'code' => 'ECN',
                'desc' => 'Principles of economics, micro and macro economics, trade, and finance.',
                'stages' => ['SSS'],
            ],
            [
                'name' => 'Government',
                'code' => 'GOV',
                'desc' => 'Political concepts, constitutions, organs of government, and diplomacy.',
                'stages' => ['SSS'],
            ],
            [
                'name' => 'Agricultural Science',
                'code' => 'AGR',
                'desc' => 'Crop production, soil science, animal husbandry, and agricultural economics.',
                'stages' => ['PRI', 'JSS', 'SSS'],
            ],
            [
                'name' => 'Literature in English',
                'code' => 'LIT',
                'desc' => 'Prose, poetry, drama, and literary criticism in English.',
                'stages' => ['SSS'],
            ],
            [
                'name' => 'Commerce',
                'code' => 'COM',
                'desc' => 'Commercial activities, trade, banking, advertising, and transport.',
                'stages' => ['SSS'],
            ],
            [
                'name' => 'Financial Accounting',
                'code' => 'ACC',
                'desc' => 'Bookkeeping, financial accounting principles, ledger accounts, and balance sheets.',
                'stages' => ['SSS'],
            ],
            [
                'name' => 'Physical & Health Education',
                'code' => 'PHE',
                'desc' => 'Athletics, sportsmanship, anatomy, hygiene, and wellness.',
                'stages' => ['PRI', 'JSS'],
            ],
        ];

        foreach ($subjectsData as $s) {
            $subject = Subject::firstOrCreate(
                ['code' => $s['code']],
                [
                    'name' => $s['name'],
                    'description' => $s['desc'],
                    'is_active' => true,
                ]
            );

            // Sync stages
            $stageIds = array_map(fn ($c) => $stageModels[$c]->id, $s['stages']);
            $subject->stages()->sync($stageIds);
        }

        // ── 4. Initial Academic Session & Terms ─────────────────────────────
        $session = AcademicSession::firstOrCreate(
            ['name' => '2026/2027'],
            [
                'start_date' => '2026-09-07',
                'end_date' => '2027-07-23',
                'status' => 'active',
                'is_current' => true,
                'description' => 'Current full academic year session for Greenwood Academy.',
            ]
        );

        $terms = [
            [
                'name' => 'First Term',
                'term_order' => 1,
                'start_date' => '2026-09-07',
                'end_date' => '2026-12-18',
                'status' => 'active',
                'is_current' => true,
            ],
            [
                'name' => 'Second Term',
                'term_order' => 2,
                'start_date' => '2027-01-11',
                'end_date' => '2027-04-09',
                'status' => 'upcoming',
                'is_current' => false,
            ],
            [
                'name' => 'Third Term',
                'term_order' => 3,
                'start_date' => '2027-05-03',
                'end_date' => '2027-07-23',
                'status' => 'upcoming',
                'is_current' => false,
            ],
        ];

        foreach ($terms as $t) {
            AcademicTerm::firstOrCreate(
                [
                    'academic_session_id' => $session->id,
                    'name' => $t['name'],
                ],
                [
                    'term_order' => $t['term_order'],
                    'start_date' => $t['start_date'],
                    'end_date' => $t['end_date'],
                    'status' => $t['status'],
                    'is_current' => $t['is_current'],
                ]
            );
        }

        $this->command->info('Academic structure seeded successfully (stages, class levels, subjects, sessions, terms).');
    }
}
