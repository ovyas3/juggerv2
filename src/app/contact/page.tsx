"use client";
import React, { useEffect, useState } from "react";
import Header from "@/components/Header/header";
import MobileHeader from "@/components/Header/mobileHeader";
import { useWindowSize } from "@/utils/hooks";
import SideDrawer from "@/components/Drawer/Drawer";
import MobileDrawer from "@/components/Drawer/mobile_drawer";
import { useSnackbar } from "@/hooks/snackBar";
import { httpsGet, httpsPost } from "@/utils/Communication";
import { useTranslations } from "next-intl";
import "./style.css";
import CountUp from "react-countup";
import searchIcon from "@/assets/search_wagon.svg";
import Image from "next/image";
import ContactTable from "./ContactTable";
import ContactFilters from "./ContactFilters";
import { redirect, useRouter, useParams } from "next/navigation";

function Contact() {
  const mobile = useWindowSize(500);
  const t = useTranslations("ETADASHBOARD");
  const todaysDate = new Date();
  const twentyDaysBefore = new Date(
    todaysDate.getTime() - 200 * 24 * 60 * 60 * 1000
  );
  const route = useRouter();

  const [ogContactDetails, setOgContactDetails] = useState([]);
  const [contactDetails, setContactDetails] = useState([]);
  const [contactDetailsPayload, setContactDetailsPayload] = useState<any>({
    from: "",
    to: "",
    contactPersonRole: [],
  });

  const handleSearch = (value: string) => {
    if (value) {
      setContactDetails(
        ogContactDetails.filter((contact: any) =>
          contact.stnName.name.toLowerCase().includes(value.toLowerCase())
        )
      );
    } else {
      setContactDetails(ogContactDetails);
    }
  };

  // api calling
  const getContactDetails = async () => {
    try {
      const response = await httpsPost(
        "contact_details/getContactDetails",
        contactDetailsPayload
      );
      if (response?.statusCode === 200) {
        setContactDetails(response?.data);
        setOgContactDetails(response?.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (contactDetailsPayload.from && contactDetailsPayload.to)
      getContactDetails();
  }, [contactDetailsPayload]);

  return (
    <div>
      {mobile ? (
        <Header title={"Contact Details"} isMapHelper={false} />
      ) : (
        <MobileHeader />
      )}

      <div
        className={`content_container_contact ${
          mobile ? "adjustMargin" : "adjustMarginMobile"
        }`}
      >
        <div id="searchContainer">
          <div id="searchBox">
            <Image src={searchIcon} alt="" style={{ cursor: "pointer" }} />
            <input
              id="inputSearch"
              placeholder="search station name"
              onChange={(e) => {
                handleSearch(e.target.value);
              }}
            />
          </div>
          <div
            id="view-all-contact-btn"
            onClick={() => {
              route.push(`/contact/allContacts`);
            }}
          >
            Contact Diary
          </div>
        </div>

        <div id="filterContainer">
          <ContactFilters setContactDetailsPayload={setContactDetailsPayload} />
        </div>

        <div id="tableContainer" style={{ marginTop: 24 }}>
          <ContactTable contactDetails={contactDetails} />
        </div>
      </div>

      {mobile ? (
        <SideDrawer />
      ) : (
        <div className="bottom_bar">
          <MobileDrawer />
        </div>
      )}
    </div>
  );
}

export default Contact;
