<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('admission_assessments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('admission_application_id')->constrained()->cascadeOnDelete();
            $table->string('assessment_type');
            $table->date('assessment_date');
            $table->decimal('score', 8, 2)->nullable();
            $table->decimal('maximum_score', 8, 2)->nullable();
            $table->text('outcome')->nullable();
            $table->text('remarks')->nullable();
            $table->string('status')->default('Pending');
            $table->foreignId('assessor_id')->constrained('users')->restrictOnDelete();
            $table->timestamps();

            $table->index(['admission_application_id', 'assessment_type'], 'admission_assessment_application_type_index');
            $table->index('status');
        });

        Schema::create('admission_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('admission_application_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->string('document_type');
            $table->string('file_path');
            $table->string('file_name');
            $table->unsignedBigInteger('file_size');
            $table->string('mime_type');
            $table->foreignId('uploaded_by')->constrained('users')->restrictOnDelete();
            $table->timestamps();

            $table->index('document_type');
        });

        Schema::create('admission_status_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('admission_application_id')->constrained()->cascadeOnDelete();
            $table->string('from_status')->nullable();
            $table->string('to_status');
            $table->text('remarks')->nullable();
            $table->foreignId('changed_by')->constrained('users')->restrictOnDelete();
            $table->timestamp('changed_at');
            $table->timestamps();

            $table->index(['admission_application_id', 'changed_at'], 'admission_status_history_application_at_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('admission_status_histories');
        Schema::dropIfExists('admission_documents');
        Schema::dropIfExists('admission_assessments');
    }
};
