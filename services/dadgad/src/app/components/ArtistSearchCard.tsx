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
    data: any[]; // Replace any with a more specific type if you have it
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
    <div className="mt-4 mx-4 card artist-search-card g-col-6 g-col-md-4" key={artistResult.id}>
      {
        artistResult.attributes.artwork ? <Image src={artistResult.attributes.artwork.url} className="card-img-top" alt={`${artistResult.attributes.name} promo`} width={100} height={100} /> : 
        <div className="h-100 placeholder-image-container d-flex justify-content-center align-items-center">
          <div className="d-flex flex-column">
            <Image src={myImage} alt="Dadgad logo" role="presentation" className="me-2" style={{width: '50px', height: 'auto'}}/>
            <FontAwesomeIcon icon={faMusic} />
          </div>
        </div>
      }
      <h2 className='text-center'>
        {artistResult.attributes.name}
      </h2>
      <a href={`artist/${artistResult.id}`} className="btn btn-primary" id={artistResult.id}>
        Start Bracket
      </a>
    </div>
  )
}
