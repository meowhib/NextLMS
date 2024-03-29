"use client";

import { ScanSearch } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { startCoursesScan } from "@/actions/courses-actions";

export default function ScanButton(){
    return (
        <DropdownMenuItem onClick={async () => {
            await startCoursesScan();
        }}>
            <ScanSearch className="h-4 w-4 mr-2" />
            Rescan
        </DropdownMenuItem>
    )
}