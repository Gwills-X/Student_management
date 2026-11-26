<?php

namespace App\Http\Controllers;

use App\Models\AdmissionApplication;
use App\Models\AdmissionDocument;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdmissionDocumentController extends Controller
{
    public function store(Request $request, AdmissionApplication $application): RedirectResponse
    {
        $this->authorize('manageDocuments', $application);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'document_type' => ['required', 'string', 'max:100'],
            'document_file' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png,webp', 'max:10240'],
        ]);

        $file = $request->file('document_file');
        $path = $file->store("admission_documents/{$application->id}", 'local');

        AdmissionDocument::create([
            'admission_application_id' => $application->id,
            'title' => $validated['title'],
            'document_type' => $validated['document_type'],
            'file_path' => $path,
            'file_name' => $file->getClientOriginalName(),
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
            'uploaded_by' => $request->user()->id,
        ]);

        return back()->with('success', 'Admission document uploaded successfully.');
    }

    public function view(AdmissionApplication $application, AdmissionDocument $document): BinaryFileResponse
    {
        $this->authorize('manageDocuments', $application);
        $this->ensureDocumentBelongsToApplication($application, $document);

        $disk = Storage::disk('local');
        if (! $disk->exists($document->file_path)) {
            abort(404, 'File not found.');
        }

        return response()->file($disk->path($document->file_path), [
            'Content-Type' => $document->mime_type,
            'Content-Disposition' => 'inline; filename="' . addcslashes($document->file_name, '"') . '"',
        ]);
    }

    public function download(AdmissionApplication $application, AdmissionDocument $document): StreamedResponse
    {
        $this->authorize('manageDocuments', $application);
        $this->ensureDocumentBelongsToApplication($application, $document);

        if (! Storage::disk('local')->exists($document->file_path)) {
            abort(404, 'File not found.');
        }

        return Storage::disk('local')->download($document->file_path, $document->file_name);
    }

    public function replace(Request $request, AdmissionApplication $application, AdmissionDocument $document): RedirectResponse
    {
        $this->authorize('manageDocuments', $application);
        $this->ensureDocumentBelongsToApplication($application, $document);

        $validated = $request->validate([
            'document_file' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png,webp', 'max:10240'],
        ]);

        $file = $validated['document_file'];
        $oldPath = $document->file_path;
        $newPath = $file->store("admission_documents/{$application->id}", 'local');

        $document->update([
            'file_path' => $newPath,
            'file_name' => $file->getClientOriginalName(),
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
            'uploaded_by' => $request->user()->id,
        ]);

        Storage::disk('local')->delete($oldPath);

        return back()->with('success', 'Admission document replaced successfully.');
    }

    public function destroy(AdmissionApplication $application, AdmissionDocument $document): RedirectResponse
    {
        $this->authorize('manageDocuments', $application);
        $this->ensureDocumentBelongsToApplication($application, $document);

        Storage::disk('local')->delete($document->file_path);
        $document->delete();

        return back()->with('success', 'Admission document removed successfully.');
    }

    private function ensureDocumentBelongsToApplication(
        AdmissionApplication $application,
        AdmissionDocument $document
    ): void {
        if ($document->admission_application_id !== $application->id) {
            abort(404);
        }
    }
}
