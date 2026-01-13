import React from "react";
import Image from "next/image";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import myImage from '../logo.png';
import { faMusic } from '@fortawesome/free-solid-svg-icons';

type ArtistAttributes = {
  genreNames: string[];
  name: string;
  url: string;
  artwork?: {
      url: string;
      width?: number;
      height?: number;
  }
};

type ArtistRelationships = {
  albums: {
    href: string;
    data: any[];
  };
};

type Artist = {
  id: string;
  type: string;
  href: string;
  attributes: ArtistAttributes;
  relationships: ArtistRelationships;
};

type ArtistSearchCardProps = {
  artistResult: Artist;
};

export default function ArtistSearchCard({artistResult}: ArtistSearchCardProps) {
  return (
    <div className="mt-4 mx-4 w-72 bg-white shadow-lg rounded-lg overflow-hidden p-4" key={artistResult.id}>
      {
        artistResult.attributes.artwork && artistResult.attributes.artwork.url ? <img src={artistResult.attributes.artwork.url} className="w-full h-48 object-cover" alt={`${artistResult.attributes.name} promo`} /> :  
        <div className="h-full flex justify-center items-center">
          <div className="flex flex-col">
            <Image src={myImage} alt="Dadgad logo" role="presentation" className="mr-2" style={{width: '50px', height: 'auto'}}/>
            <FontAwesomeIcon icon={faMusic} />
          </div>
        </div>
      }
      <h2 className='text-center py-2'>
        {artistResult.attributes.name}
      </h2>
      <a href={`artist/${encodeURIComponent(artistResult.attributes.name)}`} className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" id={artistResult.id}>
        Start Bracket
      </a>
    </div>
  )
}
