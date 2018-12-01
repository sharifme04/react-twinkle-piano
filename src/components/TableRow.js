import React from 'react';
import PropTypes from 'prop-types';

const TableRow = ({trackRecord}) => (
      <tr>
        <td>{trackRecord.title}</td>
        <td>{trackRecord.time}</td>
        <td>{trackRecord.duration}</td>
      </tr>
    );
TableRow.propTypes = {
  trackRecord: PropTypes.object
};

export default TableRow;
