import React from 'react';
import PropTypes from 'prop-types';
import data from '../data/data.json';
import ReactMarkdown from 'react-markdown';

function AboutPage() {
  return (
    <div className="container min-vh-100 d-flex flex-column justify-content-center">
      <h1>{data.aboutPage.aboutPageHeading}</h1>
      <div>
          {
            data.aboutPage.aboutPageContent.map((content, index) => (
              <ReactMarkdown key={index} >
                {content}
              </ReactMarkdown>
            ))
          }
      </div>
    </div>
  );
}

export default AboutPage;

AboutPage.propTypes = {
  aboutHeading: PropTypes.string,
  aboutPageContent: PropTypes.string,
};

AboutPage.defaultProps = {
  aboutHeading: 'This is the About page',
  aboutPageContent: 'faskjfkh',
};
