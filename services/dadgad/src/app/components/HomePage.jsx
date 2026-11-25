import React from 'react';
import HomePageContent from './HomePageContent';

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
