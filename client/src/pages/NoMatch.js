import React from "react";

function NoMatch() {
  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-12">
          <div className="jumbotron"> 
            <h1>404 Page Not Found</h1>
            <h1>
              <span role="img" aria-label="Face With Rolling Eyes Emoji">
                🙄
              </span>
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NoMatch;