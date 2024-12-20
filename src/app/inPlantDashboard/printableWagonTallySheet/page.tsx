import React, { Suspense } from "react";
import PrintableWagonTallySheet from "./printableWagonTallySheet";

export default function PrintableWagonTallySheetPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PrintableWagonTallySheet />
        </Suspense>
    );
}