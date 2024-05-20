"use client";

import { Boxes, HardDrive, PackageSearch, ScanSearch } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import {
  startLocalCoursesScan,
  startBucketCoursesScan,
} from "@/actions/courses-actions";

export default function ScanButtons() {
  return (
    <>
      <DropdownMenuItem
        onClick={async () => {
          await startLocalCoursesScan();
        }}
      >
        <HardDrive className="h-4 w-4 mr-2" />
        Rescan from Local
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={async () => {
          await startBucketCoursesScan();
        }}
      >
        <PackageSearch className="h-4 w-4 mr-2" />
        Rescan from Bucket
      </DropdownMenuItem>
    </>
  );
}
