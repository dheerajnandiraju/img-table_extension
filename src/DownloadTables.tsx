import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import JSZip from "jszip"; // Import JSZip library

const DownloadTabels = () => {
  // Function to handle downloading all tables as .xlsx files zipped into a single file
  const handleDownloadTables = async () => {
    // Query the active tab in the current window
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        // Execute script in the active tab to get all tables as HTML
        chrome.scripting.executeScript(
          {
            target: { tabId: tabs[0].id },
            func: getAllTablesAsHtml, // Function that runs in the active tab
          },
          (results) => {
            if (results && results[0]?.result?.length) {
              const tableHtmlArray = results[0].result;

              if (tableHtmlArray.length > 0) {
                zipAndDownloadTables(tableHtmlArray); // Process and download zipped tables
              } else {
                console.warn("No tables found in the active tab.");
              }
            } else {
              console.warn("Error extracting tables from the active tab.");
            }
          }
        );
      }
    });
  };

  const getAllTablesAsHtml = () => {
    const tables = Array.from(document.querySelectorAll("table")); // Select all tables
    return tables.map((table) => table.outerHTML); // Return the outerHTML of each table
  };

  // Function to convert tables to Excel, zip them, and download the zip
  const zipAndDownloadTables = async (tableHtmlArray: string[]) => {
    const zip = new JSZip();

    tableHtmlArray.forEach((tableHtml: string, index: number) => {
      const tempElement = document.createElement("div");
      tempElement.innerHTML = tableHtml;

      // Convert the HTML table to a worksheet
      const worksheet = XLSX.utils.table_to_sheet(tempElement.querySelector("table")!);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, `Table-${index + 1}`);

      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      zip.file(`Table-${index + 1}.xlsx`, excelBuffer); // Add each table to the zip
    });

    const zipBlob = await zip.generateAsync({ type: "blob" }); // Generate the zip as a blob

    saveAs(zipBlob, "all_tables.zip"); // Download the zip file
  };

  return (
    <div>
      <h1>Download All tables</h1>
      <button className="download-button" onClick={handleDownloadTables}>
        Download
      </button>
    </div>
  );
};

export default DownloadTabels;