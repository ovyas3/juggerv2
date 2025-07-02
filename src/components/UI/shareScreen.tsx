import React from "react";
import { Modal, Button, Space } from "antd";
import {
  DownloadOutlined,
  WhatsAppOutlined,
  SendOutlined,
  ShareAltOutlined,
} from "@ant-design/icons";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import { ScreenShare } from "lucide-react";
import { Tooltip } from "@mui/material";

interface ScreenShareModalProps {
  componentRef:
    | React.RefObject<HTMLDivElement>
    | ((instance: HTMLDivElement | null) => void)
    | undefined
    | null;
  color?: string;
}

export const ScreenShareModal: React.FC<ScreenShareModalProps> = ({
  componentRef,
  color = "black",
}) => {
  const screenShare = async () => {
    try {
      if (!componentRef) {
        console.error("Component ref is null");
        return;
      }

      let element: HTMLDivElement | null = null;
      if (typeof componentRef === "function") {
        console.warn("Cannot capture screen using function ref");
        return;
      } else {
        element = componentRef.current;
      }

      if (!element) {
        console.error("The DOM element is not available");
        return;
      }

      const canvas = await html2canvas(element, {
        useCORS: true,
        logging: true,
        scale: 0.7,
      });

      const dataURL = canvas?.toDataURL("image/jpeg", 0.6);

      // Function to convert data URL to Blob
      const dataURLtoBlob = (dataURL: string) => {
        const parts = dataURL.split(";base64,");
        const contentType = parts[0].split(":")[1];
        const raw = window.atob(parts[1]);
        const rawLength = raw.length;
        const uInt8Array = new Uint8Array(rawLength);

        for (let i = 0; i < rawLength; ++i) {
          uInt8Array[i] = raw.charCodeAt(i);
        }

        return new Blob([uInt8Array], { type: contentType });
      };

      // Create Blob from dataURL
      const blob = dataURLtoBlob(dataURL);

      // Create a File object from the Blob
      const file = new File([blob], "screenshot.jpg", { type: "image/jpeg" });
      const imageUrl = URL.createObjectURL(file); // Create a URL for the file

      // Show sharing modal
      Modal.confirm({
        title: "Share Screenshot",
        content: (
          <Space
            direction="vertical"
            style={{ width: "100%", marginTop: "20px" }}
          >
            <img src={imageUrl} alt="Screenshot" style={{ maxWidth: "100%" }} />

            <Button
              style={{ width: "100%" }}
              icon={<DownloadOutlined />}
              onClick={() => {
                const link = document.createElement("a");
                link.href = imageUrl;
                link.download = "screenshot.jpg";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
            >
              Download Screenshot
            </Button>

            {/* <Button
                            icon={<WhatsAppOutlined />}
                            onClick={() => {
                                // Create a blob from the screenshot
                                fetch(dataURL)
                                    .then(res => res.blob())
                                    .then(blob => {
                                        // Create object URL for the blob
                                        const blobUrl = URL.createObjectURL(blob);

                                        // Share via WhatsApp with screenshot URL
                                        const whatsappLink = `https://api.whatsapp.com/send?text=${encodeURIComponent(dataURL)}`;
                                        window.open(whatsappLink, '_blank');

                                        // Clean up blob URL
                                        URL.revokeObjectURL(blobUrl);
                                    })
                                    .catch(error => {
                                        console.error('Error preparing WhatsApp share:', error);
                                        Modal.error({
                                            title: 'Error',
                                            content: 'Failed to prepare image for WhatsApp sharing'
                                        });
                                    });
                            }}
                            style={{ width: '100%' }}
                        >
                            Share on WhatsApp
                        </Button> */}

            {/* <Button
                            icon={<SendOutlined />}
                            onClick={() => {
                                // Share the actual image via Telegram
                                const telegramLink = `https://t.me/share/url?url=${encodeURIComponent(
                                    imageUrl
                                )}`;
                                window.open(telegramLink, '_blank');
                                URL.revokeObjectURL(imageUrl); // Revoke the object URL
                            }}
                            style={{ width: '100%' }}
                        >
                            Share on Telegram
                        </Button> */}

            {/* <Button
                            icon={<ShareAltOutlined />}
                            onClick={() => {
                                if (navigator.share) {
                                    navigator
                                        .share({
                                            files: [file],
                                            title: 'Screenshot',
                                            text: 'Please find the screenshot below',
                                        })
                                        .catch(console.error);
                                    URL.revokeObjectURL(imageUrl); // Revoke the object URL
                                } else {
                                    // Download fallback
                                    const link = document.createElement('a');
                                    link.href = dataURL;
                                    link.download = 'screen_capture.jpg';
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                }
                            }}
                            style={{ width: '100%' }}
                        >
                            Share via Other Apps
                        </Button> */}
          </Space>
        ),
        width: 400,
        icon: null,
        okText: "Close",
        cancelText: null,
        maskClosable: true,
        centered: true,
      });
    } catch (error) {
      console.error("Error capturing or sharing screenshot:", error);
      Modal.error({
        title: "Error",
        content: "Failed to capture or share the screenshot",
      });
    }
  };

  return (
    <Tooltip title={"Screen Share"} placement="bottom">
      <div
        onClick={() => {
          screenShare();
        }}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 16,
          width: 16,
          marginTop: 4,
        }}
      >
        <ScreenShare style={{ cursor: "pointer", color: color }}></ScreenShare>
      </div>
    </Tooltip>
  );
};
