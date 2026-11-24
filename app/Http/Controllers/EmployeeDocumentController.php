<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\EmployeeDocument;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

class EmployeeDocumentController extends Controller
{
    /**
     * Store a newly uploaded document for an employee.
     */
    public function store(Request $request, Employee $employee): RedirectResponse
    {
        $this->authorize('manageDocuments', $employee);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'document_type' => ['required', 'string', 'in:Academic Certificate,Professional Qualification,Identification,Employment Letter,Other'],
            'document_file' => ['required', 'file', 'mimes:pdf,doc,docx,jpg,jpeg,png,webp', 'max:10240'], // 10MB max
        ]);

        $file = $request->file('document_file');
        $originalName = $file->getClientOriginalName();
        $fileSize = $file->getSize();
        $mimeType = $file->getMimeType();

        // Secure storage in private disk (not accessible publicly)
        $path = $file->store("employee_documents/{$employee->id}", 'local');

        $employee->documents()->create([
            'title' => $validated['title'],
            'document_type' => $validated['document_type'],
            'file_path' => $path,
            'file_name' => $originalName,
            'file_size' => $fileSize,
            'mime_type' => $mimeType,
            'uploaded_by' => auth()->id(),
        ]);

        return back()->with('success', "Document '{$validated['title']}' uploaded successfully.");
    }

    /**
     * Download the employee document securely.
     */
    public function download(Employee $employee, EmployeeDocument $document): StreamedResponse
    {
        $this->authorize('manageDocuments', $employee);

        if ($document->employee_id !== $employee->id) {
            abort(404);
        }

        if (! Storage::disk('local')->exists($document->file_path)) {
            abort(404, 'File not found in storage.');
        }

        return Storage::disk('local')->download($document->file_path, $document->file_name);
    }

    /**
     * View/preview the employee document inline in browser.
     */
    public function view(Employee $employee, EmployeeDocument $document): BinaryFileResponse
    {
        $this->authorize('manageDocuments', $employee);

        if ($document->employee_id !== $employee->id) {
            abort(404);
        }

        if (! Storage::disk('local')->exists($document->file_path)) {
            abort(404, 'File not found in storage.');
        }

        $fullPath = Storage::disk('local')->path($document->file_path);

        return response()->file($fullPath, [
            'Content-Type' => $document->mime_type,
            'Content-Disposition' => 'inline; filename="' . $document->file_name . '"',
        ]);
    }

    /**
     * Delete an employee document.
     */
    public function destroy(Employee $employee, EmployeeDocument $document): RedirectResponse
    {
        $this->authorize('manageDocuments', $employee);

        if ($document->employee_id !== $employee->id) {
            abort(404);
        }

        // Delete from local storage
        if (Storage::disk('local')->exists($document->file_path)) {
            Storage::disk('local')->delete($document->file_path);
        }

        $title = $document->title;
        $document->delete();

        return back()->with('success', "Document '{$title}' was deleted successfully.");
    }
}
