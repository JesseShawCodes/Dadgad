import React from 'react';
import PropTypes from 'prop-types';
import HomePageContent from '../components/HomePageContent';
import MaintenancePageContent from '../components/MaintenancePageContent';

function HomePage() 
{
  const classNames = "min-vh-100 d-flex flex-column justify-content-center";
  return (
    <>
      {
        <HomePageContent classNames={classNames} />
      }
    </>
  );
}

export default HomePage;

HomePage.propTypes = {
  homeHeading: PropTypes.string.isRequired,
  homeSubHeading: PropTypes.string.isRequired,
  homeContent: PropTypes.string.isRequired,
};
