import React from 'react';
import { Helmet } from 'react-helmet';

const WithHelmet = ({ title, children }) => {
  return (
    <>
      <Helmet>
        <title>{title} - Rima Tours & Travels</title>
      </Helmet>
      {children}
    </>
  );
};

export default WithHelmet;