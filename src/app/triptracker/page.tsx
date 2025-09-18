"use client"

import Triptracker from "@/components/triptracker/triptracker"
import { useMediaQuery, useTheme } from "@mui/material"
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function TriptrackerPage() {
  const theme = useTheme()
  const mobile = useMediaQuery(theme.breakpoints.down("sm"))
  const sp = useSearchParams();

  const [uniqueCode, setUniqCode] = useState<string>(sp.get("unique_code") as string);
  useEffect(() => {
    const unCode = sp.get("unique_code")
    console.log('unique_code:', unCode);
    if (unCode) {
      setUniqCode(unCode);
    }
  }, [sp]);
  
  return (
    <div>
      <Triptracker uniqueCode={uniqueCode}></Triptracker>
    </div>
  )
}