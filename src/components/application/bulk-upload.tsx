import { useState } from "react";
import { Upload01 } from "@untitledui/icons";
import { FileUpload } from "@/components/application/file-upload/file-upload-base";
import { Button } from "@/components/base/buttons/button";

interface TemplateLink {
    label: string;
    href: string;
}

interface BulkUploadProps {
    /** Description text shown below the heading. */
    description?: string;
    /** Label for the process button. */
    processLabel?: string;
    /** Single template download link label. Used when `templateLinks` is not provided. */
    templateLabel?: string;
    /** Single template download URL. Used when `templateLinks` is not provided. */
    templateHref?: string;
    /** Multiple template download links. Overrides `templateLabel` and `templateHref`. */
    templateLinks?: TemplateLink[];
}

export const BulkUploadContent = ({
    description = "Upload a CSV to add multiple entries at once.",
    processLabel = "Process Upload",
    templateLabel = "Download CSV template",
    templateHref = "#",
    templateLinks,
}: BulkUploadProps) => {
    const [uploadedFiles, setUploadedFiles] = useState<{ name: string; size: number; progress: number }[]>([]);

    const handleDrop = (files: FileList) => {
        const newFiles = Array.from(files).map((f) => ({
            name: f.name,
            size: f.size,
            progress: 100,
        }));
        setUploadedFiles((prev) => [...prev, ...newFiles]);
    };

    const links = templateLinks ?? [{ label: templateLabel, href: templateHref }];

    return (
        <div className="flex flex-col gap-4">
            <p className="text-sm text-tertiary">{description}</p>

            <FileUpload.Root>
                <FileUpload.DropZone
                    hint="CSV files up to 10MB"
                    accept=".csv"
                    maxSize={1024 * 1024 * 10}
                    onDropFiles={handleDrop}
                />

                {uploadedFiles.length > 0 && (
                    <FileUpload.List>
                        {uploadedFiles.map((file, i) => (
                            <FileUpload.ListItemProgressBar
                                key={`${file.name}-${i}`}
                                name={file.name}
                                size={file.size}
                                progress={file.progress}
                                onDelete={() => setUploadedFiles((prev) => prev.filter((_, idx) => idx !== i))}
                            />
                        ))}
                    </FileUpload.List>
                )}
            </FileUpload.Root>

            <div className="flex flex-col gap-2">
                <Button size="sm" color="primary" iconLeading={Upload01} isDisabled={uploadedFiles.length === 0}>
                    {processLabel}
                </Button>
                {links.map((link) => (
                    <Button key={link.href} size="sm" color="link-color" href={link.href}>
                        {link.label}
                    </Button>
                ))}
            </div>
        </div>
    );
};
