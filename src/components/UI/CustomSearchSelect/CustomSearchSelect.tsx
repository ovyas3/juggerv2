import React, { useEffect, useState } from "react";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import "./CustomSearchSelect.css";

const CustomSearchSelect = ({
  label = "labelName",
  options = [
    { _id: "1", value: "Option 1" },
    { _id: "2", value: "Option 2" },
    { _id: "3", value: "Option 3" },
    { _id: "4", value: "Option 4" },
  ],
  onChange
}: any) => {
  const [selectedRake, setSelectedRake] = useState<null | string>(null);
  const [listOpen, setListOpen] = useState(false);
  const [list, setList] = useState<any>(options);

  useEffect(()=>{
    setList(options)
  },[options])

  const handleSearch = (value: any) => {
    if (value === "") {
      setList(options);
    } else {
      setList((prev: any) => {
        return options.filter((item: any) =>
          item.value.toLowerCase().includes(value.toLowerCase())
        );
      });
    }
  };

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        position: "relative",
      }}
    >
      <label style={{ fontSize: 12 }}>{label}</label>
      <div
        onClick={(e) => {
          e.stopPropagation();
          setListOpen(!listOpen);
        }}
        style={{
          cursor: "pointer",
          width: "100%",
          border: "1px solid #DFE3EB",
          fontSize: 12,
          borderRadius: 4,
          position: "relative",
          padding: 4,
        }}
      >
        <input
          type="text"
          placeholder="Select Rake ID"
          value={selectedRake ?? ""}
          onChange={(e) => {
            e.stopPropagation();
            setSelectedRake(e.target.value)
            handleSearch(e.target.value);
          }}
          style={{
            width: "100%",
            padding: 8,
            border: "none",
            outline: "none",
            color: "black",
          }}
        />
        {listOpen ? (
          <div>
            <ArrowDropUpIcon
              style={{ fontSize: 24, position: "absolute", right: 8, top: 8 }}
            />
          </div>
        ) : (
          <div>
            <ArrowDropDownIcon
              style={{ fontSize: 24, position: "absolute", right: 8, top: 8 }}
            />
          </div>
        )}
      </div>
      {listOpen && (
        <div
          style={{
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
            position: "absolute",
            width: "100%",
            top: 70,
            borderRadius: 6,
            fontSize: 12,
            maxHeight: 200,
            overflow: "auto",
            backgroundColor:'white'
          }}
        >
          {list?.map((item: any, index: any) => {
            return (
              <div
                key={index}
                id="rakeOptions"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedRake(item.value);
                  setListOpen(false);
                  onChange(item)
                }}
              >
                {item?.value}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomSearchSelect;
