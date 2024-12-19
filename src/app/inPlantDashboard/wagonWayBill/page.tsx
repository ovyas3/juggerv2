import React, { Suspense } from "react";
import PrintableWagonWayBill from "./wagonWayBill";

export default function WagonWayBill() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PrintableWagonWayBill />
        </Suspense>
    );
}