import { Grid, IconButton, Tab, CardMedia } from "@mui/material";
import { useState } from "react";
import Link from "next/link";
import active_control_room from "../../assets/active_control_room.svg";
import inactive_contact_dashboard from "../../assets/inactive_contact_dashboard+icon.svg";

function Footer() {
  const [value, setValue] = useState("fnr");

  return (
    <Grid
      container
      sx={{
        bgcolor: "background.paper",
        position: "fixed",
        display: "flex",
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: "space-evenly",
        zIndex: 10,
      }}
    >
      <Grid item xs={6} sx={{ textAlign: "center", color: "black" }}>
        <Link href={"/fnr"} passHref>
          <Tab
            onClick={() => {
              setValue("fnr");
            }}
            label="FNR"
            icon={
              <IconButton sx={{ p: 0 }}>
                <CardMedia
                  component={"img"}
                  src={
                    value === "fnr" ? active_control_room : active_control_room
                  }
                  sx={{
                    // width:(open?'128px':'70px'),
                    // mr: open ? 3 : 'auto',
                    justifyContent: "center",
                  }}
                />
              </IconButton>
            }
            sx={{
              textTransform: "none",
              minWidth: "100px",
              padding: "0px",
              "& .MuiTab-root": {
                color: value === "fnr" ? "black" : "grey",
              },
            }}
          />
        </Link>
      </Grid>

      <Grid item xs={6} sx={{ textAlign: "center", color: "black" }}>
        <Link href="/contact" passHref>
          <Tab
            onClick={() => {
              setValue("contact");
            }}
            label="Contact"
            icon={
              <IconButton sx={{ p: 0 }}>
                <CardMedia
                  component={"img"}
                  src={
                    value === "contact"
                      ? inactive_contact_dashboard
                      : inactive_contact_dashboard
                  }
                  sx={{
                    // width:(open?'128px':'70px'),
                    // mr: open ? 3 : 'auto',
                    justifyContent: "center",
                  }}
                />
              </IconButton>
            }
            sx={{
              textTransform: "none",
              minWidth: "100px",
              padding: "0px",
              "& .MuiTab-root": {
                color: value === "contact" ? "black" : "grey",
              },
            }}
          />
        </Link>
      </Grid>
    </Grid>
  );
}

export default Footer;
