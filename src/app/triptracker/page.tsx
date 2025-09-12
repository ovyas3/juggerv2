"use client"

import Triptracker from "@/components/triptracker/triptracker"
import { useMediaQuery, useTheme } from "@mui/material"
import { useSearchParams } from "next/navigation";
export default function TriptrackerPage() {
  const theme = useTheme()
  const mobile = useMediaQuery(theme.breakpoints.down("sm"))
  const sp = useSearchParams();

  // const uniqueCode ="TbaTlSmC50";
  // const uniqueCode ="xl4hU5SGXz";
  // const uniqueCode ="xl4hU5SGXz";
  const uniqueCode ="2mV4U5t8xQ";
  
  // const uniqueCode ="nE3ZXGJQKZ";
    // sp.get("unique_code") ?? sp.get("code") ?? "";
  return (
    <div>
      <Triptracker uniqueCode={uniqueCode}></Triptracker>
    </div>
  )
}