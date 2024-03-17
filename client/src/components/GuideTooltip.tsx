import React from 'react';
import { Tooltip } from 'react-tooltip';
import './GuideTooltip.css';

interface GuideTooltipProps {
    id: string;
    children: ReactNode;
  }

const TooltipContent = () => {
  return (
    <>
      <h2>Guide for Formatting Data</h2>
      <h3>Accepted File Formats:</h3>
      <ul>
        <li>CSV (Comma-Separated Values)</li>
      </ul>
      <h3>Accepted Types of Geospatial Identification:</h3>
      <p>Geospatial identification can be represented using one of the following accepted types: latitude/longitude coordinates, CRUID (Crop Region Unique Identifier), or Abbreviated Province and Crop Region. It is essential to maintain consistency in the chosen type throughout the entire dataset.</p>
      <blockquote>
        <p><strong>Note:</strong> If you opt for using Crop District (CD), ensure to include the Abbreviated Province as well. For reference regarding expected abbreviations, consult the <a href="https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/completing-slips-summaries/financial-slips-summaries/return-investment-income-t5/provincial-territorial-codes.html">provincial and territorial codes</a>.</p>
      </blockquote>
      <h3>1. Order of Columns:</h3>
      <p>Arrange the columns in your dataset in the following order:</p>
      <ol>
        <li><strong>Geospatial Identification</strong>: Place this as the first column in your file. Choose one consistent method (latitude/longitude, CRUID, or Abbreviated Province and Crop Region) for identifying sample locations.</li>
        <li><strong>Sample Count</strong></li>
        <li><strong>Additional Properties</strong>: Include any relevant additional properties, such as year or station, in subsequent columns.</li>
      </ol>
      <h3>2. Header Names:</h3>
      <p>Adhere to the specified naming conventions for the headers:</p>
      <p><strong>Latitude/Longitude:</strong></p>
      <table>
        <thead>
          <tr>
            <th>Latitude</th>
            <th>Longitude</th>
            <th>Samples</th>
          </tr>
        </thead>
      </table>
      <p><strong>CRUID:</strong></p>
      <table>
        <thead>
          <tr>
            <th>CRUID</th>
            <th>Samples</th>
          </tr>
        </thead>
      </table>
      <p><strong>Abbreviated Province and Crop Region:</strong></p>
      <table>
        <thead>
          <tr>
            <th>Province</th>
            <th>CD</th>
            <th>Samples</th>
          </tr>
        </thead>
      </table>
      <p>Ensure that the data you wish to be presented on the map is contained within a column named 'Samples'.</p>
      <h3>3. Null Values:</h3>
      <p>Indicate empty or missing data fields using appropriate null value indicators:</p>
      <ul>
        <li>Leave cells empty for null values, or use placeholders such as "N/A" or "NULL" to denote missing information.</li>
      </ul>
    </>
  );
};

const GuideTooltip: React.FC<GuideTooltipProps> = ({ id, children }) => {
    return (
    <>
        <div className='GuideTooltip'>
            <a data-tooltip-id={id}
            data-tooltip-delay-hide={900000}>
                {children}
            </a>
            <Tooltip id={id} clickable style={{  }}>
                <TooltipContent />
            </Tooltip>
        </div>
    </>
  );
};

export default GuideTooltip;