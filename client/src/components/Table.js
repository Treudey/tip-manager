import React from 'react';
import { Link } from "react-router-dom";

const Row = (props) => {
  const tableData = [];
  for (const key in props.rowData) {
    if (props.rowData.hasOwnProperty(key) && key !== 'id') {
      tableData.push(<td key={key}>{props.rowData[key]}</td>);
    } 
  } 
  if (props.name) {
    tableData.unshift(<td key={props.name}>{props.name}</td>);
  }
  if (props.delete) {
    tableData.push(<td key={props.rowData.id}><Link to={"/edit/" + props.rowData.id}>Edit</Link> | <a className="text-danger" href="# " onClick={ () => props.delete(props.rowData.id) }>Delete</a></td>);
  }

  return (
    <tr>
      {tableData}
    </tr>
  );
};


const Table = props => {
  let rowList = [];
  if (Array.isArray(props.rowData)) {
    rowList = props.rowData.map(e => {
      return <Row rowData={e} delete={props.delete} key={e.id}/>;
    });
  } else {
    for (const key in props.rowData) {
      if (props.rowData.hasOwnProperty(key)) {
        const element = props.rowData[key];
        rowList.push((<Row rowData={element.totals} key={key} name={key} />));
      }
    }
  }

  return (
    <div className="table-responsive">
      <table className="table">
        <thead className="thead-light">
          <tr>
          {props.headers.map(e => {
            return <th key={e}>{e}</th>;
          })}
          </tr>
        </thead>
        <tbody>
          {rowList}
        </tbody>
      </table>
    </div>
  );
  
};

export default Table;