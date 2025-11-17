import React, { useState } from "react";
import Welcome from "./components/Welcome";

export default function SmartBioFarm() {
  const [currentPage, setCurrentPage] = useState("welcome");

  const navigate = (page) => setCurrentPage(page);
  if (currentPage === "welcome") {
    return <Welcome onGetStarted={() => setCurrentPage("profession")} />;
  }

  return null;
}