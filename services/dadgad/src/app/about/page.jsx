import React from 'react';
import PropTypes from 'prop-types';
import data from '../data/data.json';
import ReactMarkdown from 'react-markdown';

function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-6 text-center">{data.aboutPage.aboutPageHeading}</h1>
      <div className="max-w-prose text-lg leading-relaxed">
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
