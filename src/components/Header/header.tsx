import { Container, Grid, Avatar, useMediaQuery, Box, CardMedia } from "@mui/material";
import { useRouter } from "next/router";
import Dropdown from "./dropdown";
import notification from "../../assets/notification_icon.svg";
import maskGroup from "../../assets/MaskGroup1.png";
import logo from "../../assets/logo_hover_icon.svg";

const Header = () => {
  const mobile = !useMediaQuery("(min-width:600px)");
  const location = useRouter();
  console.log("location header", location);
  const routeName = location.pathname.split("/")[1];

  return (
    <Box
      sx={{
        position: "fixed",
        display: "flex",
        left: 0,
        right: 0,
        top: 0,
        zIndex: 1,
        height: mobile ? "160px" : "56px",
        color: mobile ? "#FFFFFF" : "#131722",
        m: 0,
        p: 0,
        minWidth: "100vw",
        background: "#FFFFFF 0% 0% no-repeat padding-box",
        border: "1px solid #DFE3EB",
      }}
    >
      {mobile && (
        <Container>
          <Grid
            container
            justifyContent={"space-between"}
            alignItems={"center"}
            sx={{ marginBottom: "20px", paddingTop: "10px", height: "32px" }}
          >
            <Grid item xs={8}>
              <CardMedia
                component={"img"}
                src={logo}
                sx={{
                  width: "100px",
                  height: "30px",
                  ml: -2,
                  justifyContent: "center",
                }}
              />
            </Grid>
            <Grid item xs={2}>
              <Avatar alt="Person" src={maskGroup.toString()} />
            </Grid>
          </Grid>
          <Grid pt={2} container rowSpacing={1}>
            <Grid item xs={12} color={"#42454E"}>
              {"JSPL"}
            </Grid>
            <Grid item xs={12}>
              <Dropdown />
            </Grid>
          </Grid>
        </Container>
      )}
      {!mobile && (
        <>
          <Grid
            container
            justifyContent={"space-between"}
            alignItems={"center"}
            sx={{ width: "100vw", padding: "10px 0px" }}
          >
            <Grid
              item
              xs={6}
              sx={{ paddingLeft: "94px", fontWeight: "bold", fontSize: "20px" }}
            >
              {routeName === "fnr" ? "FNR Dashboard" : "Contact dashboard"}
            </Grid>
            <Grid item xs={4}>
              <Grid container>
                <Grid
                  sx={{
                    display: "flex",
                    justifyContent: "right",
                    alignItems: "center",
                  }}
                  item
                  xs={3}
                >
                  JSP
                </Grid>
                <Grid
                  item
                  xs={5}
                  sx={{
                    height: "35px",
                    display: "flex",
                    justifyContent: "center",
                    maxWidth: "148px",
                  }}
                >
                  <Dropdown />
                </Grid>
                <Grid
                  item
                  xs={2}
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    borderLeft: "2px solid #DFE3EB;",
                  }}
                >
                  <Avatar
                    sx={{ maxHeight: "36px", maxWidth: "36px" }}
                    alt="Notification"
                    src={notification}
                  />
                </Grid>
                <Grid
                  item
                  xs={2}
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    borderLeft: "2px solid #DFE3EB;",
                  }}
                >
                  <Avatar
                    sx={{ maxHeight: "36px", maxWidth: "36px" }}
                    alt="Person"
                    src={maskGroup.toString()} // Convert maskGroup to a string
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default Header;
