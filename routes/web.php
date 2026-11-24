<?php

use App\Http\Controllers\AcademicSessionController;
use App\Http\Controllers\AcademicStructureController;
use App\Http\Controllers\AcademicTermController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\ClassSubjectController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EmployeeAccountController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\EmployeeDocumentController;
use App\Http\Controllers\SchoolClassController;
use App\Http\Controllers\SubjectController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes — School Management System
|--------------------------------------------------------------------------
|
| Stage 1: Foundation & Authentication
| Stage 2: Employee Management & User Administration
| Stage 3: Academic Structure & Configuration
|
*/

// ── Guest-only routes ──────────────────────────────────────────────────────
Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'create'])->name('login');
    Route::post('/login', [LoginController::class, 'store'])->name('login.attempt');
});

// ── Authenticated routes ───────────────────────────────────────────────────
Route::middleware('auth')->group(function () {
    Route::post('/logout', [LoginController::class, 'destroy'])->name('logout');
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // ── Employee Management (Stage 2) ──────────────────────────────────────
    Route::get('/employees', [EmployeeController::class, 'index'])->name('employees.index');
    Route::get('/employees/create', [EmployeeController::class, 'create'])->name('employees.create');
    Route::post('/employees', [EmployeeController::class, 'store'])->name('employees.store');
    Route::get('/employees/{employee}', [EmployeeController::class, 'show'])->name('employees.show');
    Route::get('/employees/{employee}/edit', [EmployeeController::class, 'edit'])->name('employees.edit');
    Route::post('/employees/{employee}', [EmployeeController::class, 'update'])->name('employees.update');
    Route::delete('/employees/{employee}', [EmployeeController::class, 'destroy'])->name('employees.destroy');
    Route::patch('/employees/{employee}/status', [EmployeeController::class, 'updateStatus'])->name('employees.status.update');

    // ── Employee Account Management (Stage 2) ──────────────────────────────
    Route::post('/employees/{employee}/account', [EmployeeAccountController::class, 'store'])->name('employees.account.store');
    Route::post('/employees/{employee}/account/link', [EmployeeAccountController::class, 'link'])->name('employees.account.link');
    Route::delete('/employees/{employee}/account/unlink', [EmployeeAccountController::class, 'unlink'])->name('employees.account.unlink');
    Route::patch('/employees/{employee}/account/toggle-active', [EmployeeAccountController::class, 'toggleActive'])->name('employees.account.toggle-active');
    Route::post('/employees/{employee}/account/reset-password', [EmployeeAccountController::class, 'resetPassword'])->name('employees.account.reset-password');

    // ── Employee Documents (Stage 2) ───────────────────────────────────────
    Route::post('/employees/{employee}/documents', [EmployeeDocumentController::class, 'store'])->name('employees.documents.store');
    Route::get('/employees/{employee}/documents/{document}/download', [EmployeeDocumentController::class, 'download'])->name('employees.documents.download');
    Route::get('/employees/{employee}/documents/{document}/view', [EmployeeDocumentController::class, 'view'])->name('employees.documents.view');
    Route::delete('/employees/{employee}/documents/{document}', [EmployeeDocumentController::class, 'destroy'])->name('employees.documents.destroy');

    // ── User Administration (Stage 2) ──────────────────────────────────────
    Route::get('/users', [UserController::class, 'index'])->name('users.index');
    Route::post('/users', [UserController::class, 'store'])->name('users.store');
    Route::put('/users/{user}', [UserController::class, 'update'])->name('users.update');
    Route::patch('/users/{user}/toggle-status', [UserController::class, 'toggleStatus'])->name('users.toggle-status');
    Route::post('/users/{user}/reset-password', [UserController::class, 'resetPassword'])->name('users.reset-password');

    // ── Academic Sessions & Terms (Stage 3) ────────────────────────────────
    Route::get('/academic/sessions', [AcademicSessionController::class, 'index'])->name('academic.sessions.index');
    Route::post('/academic/sessions', [AcademicSessionController::class, 'store'])->name('academic.sessions.store');
    Route::get('/academic/sessions/{session}', [AcademicSessionController::class, 'show'])->name('academic.sessions.show');
    Route::put('/academic/sessions/{session}', [AcademicSessionController::class, 'update'])->name('academic.sessions.update');
    Route::patch('/academic/sessions/{session}/make-current', [AcademicSessionController::class, 'makeCurrent'])->name('academic.sessions.make-current');
    Route::delete('/academic/sessions/{session}', [AcademicSessionController::class, 'destroy'])->name('academic.sessions.destroy');

    Route::post('/academic/sessions/{session}/terms', [AcademicTermController::class, 'store'])->name('academic.terms.store');
    Route::put('/academic/terms/{term}', [AcademicTermController::class, 'update'])->name('academic.terms.update');
    Route::patch('/academic/terms/{term}/make-current', [AcademicTermController::class, 'makeCurrent'])->name('academic.terms.make-current');
    Route::delete('/academic/terms/{term}', [AcademicTermController::class, 'destroy'])->name('academic.terms.destroy');

    // ── Education Stages & Class Levels (Stage 3) ──────────────────────────
    Route::get('/academic/structure', [AcademicStructureController::class, 'index'])->name('academic.structure.index');
    Route::post('/academic/stages', [AcademicStructureController::class, 'storeStage'])->name('academic.stages.store');
    Route::put('/academic/stages/{stage}', [AcademicStructureController::class, 'updateStage'])->name('academic.stages.update');
    Route::patch('/academic/stages/{stage}/toggle-status', [AcademicStructureController::class, 'toggleStageStatus'])->name('academic.stages.toggle-status');

    Route::post('/academic/levels', [AcademicStructureController::class, 'storeLevel'])->name('academic.levels.store');
    Route::put('/academic/levels/{level}', [AcademicStructureController::class, 'updateLevel'])->name('academic.levels.update');
    Route::patch('/academic/levels/{level}/toggle-status', [AcademicStructureController::class, 'toggleLevelStatus'])->name('academic.levels.toggle-status');

    // ── Classes & Arms (Stage 3) ───────────────────────────────────────────
    Route::get('/academic/classes', [SchoolClassController::class, 'index'])->name('academic.classes.index');
    Route::get('/academic/classes/create', [SchoolClassController::class, 'create'])->name('academic.classes.create');
    Route::post('/academic/classes', [SchoolClassController::class, 'store'])->name('academic.classes.store');
    Route::get('/academic/classes/{class}', [SchoolClassController::class, 'show'])->name('academic.classes.show');
    Route::put('/academic/classes/{class}', [SchoolClassController::class, 'update'])->name('academic.classes.update');
    Route::delete('/academic/classes/{class}', [SchoolClassController::class, 'destroy'])->name('academic.classes.destroy');

    // ── Subjects (Stage 3) ─────────────────────────────────────────────────
    Route::get('/academic/subjects', [SubjectController::class, 'index'])->name('academic.subjects.index');
    Route::post('/academic/subjects', [SubjectController::class, 'store'])->name('academic.subjects.store');
    Route::get('/academic/subjects/{subject}', [SubjectController::class, 'show'])->name('academic.subjects.show');
    Route::put('/academic/subjects/{subject}', [SubjectController::class, 'update'])->name('academic.subjects.update');
    Route::delete('/academic/subjects/{subject}', [SubjectController::class, 'destroy'])->name('academic.subjects.destroy');

    // ── Class-Subject Assignments (Stage 3) ────────────────────────────────
    Route::post('/academic/classes/{class}/subjects', [ClassSubjectController::class, 'store'])->name('academic.classes.subjects.store');
    Route::post('/academic/classes/{class}/subjects/bulk-sync', [ClassSubjectController::class, 'bulkSync'])->name('academic.classes.subjects.bulk-sync');
    Route::delete('/academic/classes/{class}/subjects/{subject}', [ClassSubjectController::class, 'destroy'])->name('academic.classes.subjects.destroy');
});

// ── Root redirect ──────────────────────────────────────────────────────────
Route::get('/', function () {
    return redirect()->route('dashboard');
});
