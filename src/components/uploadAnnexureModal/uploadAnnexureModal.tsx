"use client";

import dropdownIcon from "../../assets/dropdown-icon.svg";
import { Box, Input } from "@mui/material";
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
import React, { useState, useEffect,useRef } from "react";
import DownloadIcon from "@/assets/download.svg";
import DeleteIcon from "@/assets/delete.svg";
import CloseButtonIcon from "@/assets/close_icon.svg";
import Image from "next/image";

import { styled } from "@mui/system";
import { httpsGet, httpsPost } from "@/utils/Communication";
import "./uploadAnnexureModal.css";
import { useSnackbar } from "@/hooks/snackBar";

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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { showMessage } = useSnackbar();
  const [handlingAgents, setHandlingAgents] = useState([]);
  const [selectedHandlingAgent, setSelectedHandlingAgent] = useState<any>(null);
  const [actionsDrop, setActionsDrop] = useState(-1);
  const [uploadFile, setUploadFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [index, setIndex] = useState("");

  const [annexure, setAnnexure] = useState<any>([]);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleFileChange = (event: any) => {
    setUploadFile(event.target.files[0]);
  };

  const selectHandlingAgent = (option: any) => {
    setSelectedHandlingAgent(option);
    setDropdownOpen(false);
  };

  function clearInput() {
    setSelectedHandlingAgent("");
    setIndex("");
    setFileName("");
    setUploadFile(null);
  }

  const handleUploadRakeDoc = () => {
    if (!selectedHandlingAgent) {
      showMessage("Please select a Handling Agent", "error");
    } else if (!fileName) {
      showMessage("File Name cannot be empty", "error");
    } else if (!index) {
      showMessage("Please give a valid File Index", "error");
    } else if (!uploadFile) {
      showMessage("Please select a file to upload", "error");
    } else {
      const payload = {
        rakeShipmentId: shipmentID,
        docIndex: index,
        handlingAgent: selectedHandlingAgent._id,
        docName: fileName.trim(),
        file: uploadFile,
      };
      httpsPost("rake_shipment/upload_rake_annexure", payload, 0, true)
        .then((response) => {
          showMessage("File Uploaded Succcessfully", "success");
          clearInput();
          getDocData();
        })
        .catch((err) =>
          showMessage("Something went wrong, Please try again", "error")
        );
    }
  };

  const handleDeleteDoc = (element: any) => {
    const payload = {
      handlingAgent: element.handling_agent._id,
      rakeShipmentId: shipmentID,
      docIndex: element.index,
    };
    httpsPost("rake_shipment/delete_ra_document", payload)
      .then((response) => {
        if (response.statusCode == 200) {
          showMessage(
            `Deleted ${element.doc_name} File Successfully`,
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
              index: value.doc_index,
              date: value.created_at
                ? timeUtils.formatDate(value.created_at)
                : "",
              handling_agent: value.handling_agent,
              doc_name: value.docName,
              doc_link: value.link,
            };
          });
          // const sortedDataByIndex = rakeDocData.sort((a: any, b: any) => {
          //   return a.index - b.index;
          // });
          setAnnexure(rakeDocData);
        }
      })
      .catch((err) => console.log(err));
  }

  function getHandlingAgents() {
    httpsGet(`handling_agent/get_rake_shipment_ha?id=${shipmentID}`)
      .then((response: any) => {
        const data = response.data;
        if (data.length) {
          setHandlingAgents(data[0].HA);
        }
      })
      .catch((err) => {});
  }

  useEffect(() => {
    getDocData();
    getHandlingAgents();
  }, [shipmentID]);

  const actions = [
    {
      name: "Delete Upload",
      icon: DeleteIcon.src,
      fn: (ele: any) => handleDeleteDoc(ele),
    },
  ];

  const handleDownload = (rowData:any) => {
    fetch(rowData.doc_link)
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${rowData.doc_name}-${rowData.index}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      })
      .catch(() => alert('Failed to download file.'));
  };

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
              <Image src={CloseButtonIcon} className="close-btn" alt="Close Button" />
            </div>
            <div>
              <h3>Upload Rake Annexure Document</h3>
            </div>
            <div className="fnr-no">
              Shipment FNR: <b>{FNR_No}</b>
            </div>
            <div className="add-wrapper">
              <div style={{ display: "flex", columnGap: "10px" }}>
                <div className="custom-select">
                  <div className="select-input" onClick={toggleDropdown}>
                    <div className="selected-options">
                      <span>
                        {selectedHandlingAgent
                          ? selectedHandlingAgent.name
                          : "Handling Agent"}
                      </span>
                    </div>
                    <span className={`arrow ${dropdownOpen ? "open" : ""}`}>
                      <img
                        src={dropdownIcon.src}
                        height="24px"
                        width="24px"
                        alt="down-arrow"
                      />
                    </span>
                  </div>
                  {dropdownOpen && (
                    <div className="select-dropdown">
                      <div className="select-options">
                        {handlingAgents.map((option: any, index) => (
                          <div
                            className="option"
                            key={index}
                            onClick={() => selectHandlingAgent(option)}
                            style={{ cursor: "pointer" }}
                          >
                            {option.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <div className="custom-select">
                    <div className="select-input">
                      <input
                        placeholder="File Name"
                        onChange={(e) => setFileName(e.target.value)}
                        value={fileName}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <div>
                    <input
                      type="number"
                      placeholder="Index"
                      min={1}
                      value={index}
                      onChange={(e) => {
                        setIndex(e.target.value);
                      }}
                      className="number-index"
                    />
                  </div>
                </div>
                <div>
                  <Input
                    type="file"
                    id="fileInput"
                    onChange={handleFileChange}
                    sx={{
                      "&.MuiInput-root": {
                        fontSize: "12px",
                        width: "160px",
                      },
                    }}
                  />
                </div>
              </div>
              <div>
                <button className="upload-btn" onClick={handleUploadRakeDoc}>
                  Upload
                </button>
              </div>
            </div>
            <div className="table-wrapper">
              <TableContainer component={Paper} style={{ maxHeight: "410px" }} className="table-cont">
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
                        Date
                      </TableCell>
                      <TableCell
                        style={{ background: "whitesmoke", color: "#545454" }}
                      >
                        Handling Agent
                      </TableCell>
                      <TableCell
                        style={{ background: "whitesmoke", color: "#545454" }}
                      >
                        Document
                      </TableCell>
                      <TableCell
                        style={{ background: "whitesmoke", color: "#545454" }}
                      >
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {annexure.map((row: any, index: any) => (
                      <TableRow key={index}>
                        <TableCell>{index+1}</TableCell>
                        <TableCell>{row.date}</TableCell>
                        <TableCell>
                          {row.handling_agent?.name || "N/A"}
                        </TableCell>
                        <TableCell>
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            {row.doc_name}-{row.index}
                          </div>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              fontWeight: 600,
                              maxWidth: "fit-content",
                              color: "#20114d",
                              cursor: "pointer",
                            }}
                            onClick={()=>handleDownload(row)}
                          >
                            Click here to download
                            <img
                              src={DownloadIcon.src}
                              height={16}
                              width={16}
                              style={{ cursor: "pointer" }}
                            />
                          </div>
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
                              <div className="action-drop">
                                {actions.map((item, index) => (
                                  <div
                                    className="actions-row"
                                    onClick={() => {item.fn(row);setActionsDrop(-1)}}
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
