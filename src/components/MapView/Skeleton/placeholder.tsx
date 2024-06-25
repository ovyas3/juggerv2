import * as React from 'react';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

export default function Placeholder() {
  return (
    <Stack sx={{
        display: "flex",
        flexDirection: "row",
        margin: "0px",
        padding: "0px",
    }}>
     {/* create a skeleton for a 30% width 100vh height rectangle of left and 70% with react on right in side the right rec tangle  rec tangles which will be right aligne */}
    <Skeleton variant="rectangular" width={70} height={"100vh"} />
    <Stack sx={{
        display: "flex",
        flexDirection: "column",
        margin: "0px",
        padding: "0px",
        width: "100%",
    }}>
        <Skeleton variant="rectangular" width={"100%"} height={40} />
        <Stack sx={{
            display: "flex",
            flexDirection: "row",
            margin: "0px",
            padding: "0px",
            width: "100%",
        }}>
            <Stack sx={{
                    display: "flex",
                    flexDirection: "column",
                    margin: "0px",
                    padding: "10px",
                    height: "100vh",
                    width: "30%",
                    backgroundColor: "#fff",
                }}>
                    <Skeleton sx={{
                        borderRadius: "10px",
                    }} variant="rectangular" width={"100%"} height={400} />
                    <Skeleton sx={{
                        borderRadius: "10px",
                        marginTop: "10px",
                    }} variant="rectangular" width={"100%"} height={600} />
            </Stack>
            <Skeleton sx={{
                        borderRadius: "10px",
                        marginLeft: "10px",
                        marginTop: "10px",
                    }} variant="rectangular" width={"69%"} height={"99%"} />
        </Stack>
    </Stack>
    </Stack>
  );
}