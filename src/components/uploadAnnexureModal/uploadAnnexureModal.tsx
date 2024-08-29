"use client";

import { Box, TextField } from "@mui/material";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import timeUtils from "../../utils/timeService";
import Dialog from "@mui/material/Dialog";
import React, { useState, useEffect, useRef } from "react";
import DownloadIcon from "@/assets/download.svg";
import DeleteIcon from "@/assets/delete.svg";
import CloseButtonIcon from "@/assets/close_icon.svg";
import Image from "next/image";

import { styled } from "@mui/system";
import { httpsGet, httpsPost } from "@/utils/Communication";
import "./uploadAnnexureModal.css";
import { useSnackbar } from "@/hooks/snackBar";
import { useTranslations } from "next-intl";

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialogContent-root": {
    padding: theme.spacing(2),
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));

interface PopupProps {
  isOpen: boolean;
  isClose: () => void;
  shipmentID: string;
  FNR_No: string;
}

const UploadAnnexure: React.FC<PopupProps> = ({
  isOpen,
  isClose,
  shipmentID,
  FNR_No,
}) => {
  const { showMessage } = useSnackbar();
  const [actionsDrop, setActionsDrop] = useState(-1);
  const [uploadFile, setUploadFile] = useState([]);
  const fileInputRef = useRef([]);
  const t = useTranslations("UPLOAD_ANNEXURE");

  const [annexure, setAnnexure] = useState<any>([]);

  const handleFileChange = (event: any) => {
    if (event.target.files.length <= 10) {
      setUploadFile(event.target.files);
    } else {
      showMessage(t("SNCKBR_MSG.fileLimit"), "error",10000);
      clearInput()
    }
  };

  function clearInput() {
    setUploadFile([]);
    //@ts-ignore
    fileInputRef.current.value = "";
  }

  const handleUploadRakeDoc = () => {
    if (!uploadFile.length) {
      showMessage(t("SNCKBR_MSG.minFiles"), "error");
    } else {
      const payload = {
        rakeShipmentId: shipmentID,
        file: uploadFile,
      };
      httpsPost("rake_shipment/upload_rake_annexure", payload, 0, true)
        .then((response) => {
          clearInput();
          showMessage("File Uploaded Succcessfully", "success");
          getDocData();
        })
        .catch((err) =>
          showMessage("Something went wrong, Please try again", "error")
        );
    }
  };

  const handleDeleteDoc = (element: any) => {
    const payload = {
      raId: element._id,
    };
    httpsPost("rake_shipment/delete_ra_document", payload)
      .then((response) => {
        if (response.statusCode == 200) {
          showMessage(
            t("SNCKBR_MSG.deleteMsg", { doc_name: element.doc_name }),
            "success"
          );
          getDocData();
        } else showMessage("Something went wrong, Please try again", "error");
      })
      .catch((err) => {
        showMessage("Something went wrong, Please try again", "error");
      });
  };

  function getDocData() {
    httpsGet(`get/rake_shipment/get_ra_documents?rakeShipmentId=${shipmentID}`)
      .then((response) => {
        const data = response.data;
        if (data) {
          let rakeDocData = data.map((value: any) => {
            return {
              date: value.created_at
                ? timeUtils.formatDate(value.created_at)
                : "",
              doc_name: value.docs_link && value.docs_link.doc_name,
              doc_link: value.docs_link && value.docs_link.link,
              _id: value._id,
            };
          });
          setAnnexure(rakeDocData);
        }
      })
      .catch((err) => console.log(err));
  }

  useEffect(() => {
    getDocData();
  }, [shipmentID]);

  const actions = [
    {
      name: "Delete Upload",
      icon: DeleteIcon.src,
      fn: (ele: any) => handleDeleteDoc(ele),
    },
  ];

  function handleActionsMenu(index: number) {
    if (actionsDrop === index) setActionsDrop(-1);
    else setActionsDrop(index);
  }

  return (
    <React.Fragment>
      <BootstrapDialog
        onClose={isClose}
        className="uplaod-modal"
        aria-labelledby="customized-dialog-title"
        open={isOpen}
      >
        <Box sx={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          <div className="upload-annexure">
            <div aria-label="close" onClick={isClose}>
              <Image
                src={CloseButtonIcon}
                className="close-btn"
                alt="Close Button"
              />
            </div>
            <div>
              <h3>Upload Rake Annexure Document</h3>
            </div>
            <div className="fnr-no">
              Shipment FNR: <b>{FNR_No}</b>
            </div>
            <div className="add-wrapper">
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  columnGap: "10px",
                }}
              >
                <div>
                  <TextField
                    type="file"
                    id="fileInput"
                    onChange={handleFileChange}
                    inputProps={{
                      multiple: true,
                      accept:
                        ".png,.jpg,.jpeg,.gif,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv",
                    }}
                    inputRef={fileInputRef}
                    sx={{
                      "& .MuiOutlinedInput-input": {
                        fontSize: "12px",
                        padding: "6px 8px 12px 8px",
                        width: "180px",
                      },
                    }}
                  />
                </div>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <button
                    style={{
                      padding: "6px",
                      color: "#20114d",
                      background: "whitesmoke",
                      borderRadius: "6px",
                      cursor: "pointer",
                    }}
                    onClick={() => clearInput()}
                  >
                    Clear Selection
                  </button>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    fontSize: "12px",
                  }}
                >
                  <b>Note:</b>&nbsp;
                  <span>{t("SNCKBR_MSG.noteMsg")}</span>
                </div>
              </div>
              <div>
                <button className="upload-btn" onClick={handleUploadRakeDoc}>
                  Upload
                </button>
              </div>
            </div>
            <div className="table-wrapper">
              <TableContainer
                component={Paper}
                style={{ maxHeight: "410px" }}
                className="table-cont"
              >
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell
                        style={{ background: "whitesmoke", color: "#545454" }}
                      >
                        #
                      </TableCell>
                      <TableCell
                        style={{ background: "whitesmoke", color: "#545454" }}
                      >
                        Uploaded at
                      </TableCell>
                      <TableCell
                        style={{ background: "whitesmoke", color: "#545454" }}
                      >
                        Document
                      </TableCell>
                      <TableCell
                        style={{ background: "whitesmoke", color: "#545454" }}
                      >
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {annexure.map((row: any, index: any) => (
                      <TableRow key={index} className="table-row">
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{row.date}</TableCell>
                        <TableCell>
                          <a
                            style={{
                              display: "flex",
                              alignItems: "center",
                              fontWeight: 600,
                              color: "#20114d",
                              cursor: "pointer",
                              textDecoration: "none",
                              width:"max-content"
                            }}
                            href={row.doc_link}
                          >
                            <div
                              style={{
                                maxWidth: "300px",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {row.doc_name}
                            </div>
                            <img
                              src={DownloadIcon.src}
                              height={16}
                              width={16}
                              style={{ cursor: "pointer" }}
                            />
                          </a>
                        </TableCell>
                        <TableCell>
                          <div style={{ position: "relative" }}>
                            <button
                              className="actions"
                              onClick={() => handleActionsMenu(index)}
                            >
                              <div
                                style={{ display: "flex", columnGap: "2px" }}
                              >
                                <div className="dot" />
                                <div className="dot" />
                                <div className="dot" />
                              </div>
                            </button>
                            {actionsDrop === index && (
                              <>
                                <div className="action-drop">
                                  {actions.map((item, index) => (
                                    <div
                                      className="actions-row"
                                      key={index}
                                      onClick={() => {
                                        item.fn(row);
                                        setActionsDrop(-1);
                                      }}
                                    >
                                      <img
                                        src={item.icon}
                                        height={"16px"}
                                        width={"16px"}
                                      />
                                      {item.name}
                                    </div>
                                  ))}
                                </div>
                                <div
                                  className="overlay-container"
                                  onClick={() => setActionsDrop(-1)}
                                ></div>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          </div>
        </Box>
      </BootstrapDialog>
    </React.Fragment>
  );
};

export default UploadAnnexure;
