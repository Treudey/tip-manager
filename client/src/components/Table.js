import React from 'react';
import { Link } from "react-router-dom";

const Row = props => {
  const tableData = [];
  for (const key in props.rowData) {
    if (props.rowData.hasOwnProperty(key) && key !== 'id') {
      tableData.push(<td key={key}>{props.rowData[key]}</td>);
    } 
  } 
  if (props.delete !== null) {
    tableData.push(<td key={props.rowData.id}><Link to={"/edit/" + props.rowData.id}>Edit</Link> | <a className="text-danger" href="# " onClick={ () => props.delete(props.rowData.id) }>Delete</a></td>);
  }
  

  return (
    <tr>
      {tableData}
    </tr>
  );
};


const Table = props => {
  return (
    <table className="table">
      <thead className="thead-light">
        <tr>
        {props.headers.map(e => {
          return <th key={e}>{e}</th>;
        })}
        </tr>
      </thead>
      <tbody>
        {props.rowList.map(e => {
          return <Row rowData={e} delete={props.delete || null} key={e.name || e.id}/>;
        })}
      </tbody>
    </table>
  );
  
};

export default Table;