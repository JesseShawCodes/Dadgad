from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.renderers import JSONRenderer
from .models import Bracket
from .serializers import BracketSerializer, MatchupSerializer
from .services import BracketService
from apple_search.artist_page import artist_content

class BracketCreateView(APIView):
    renderer_classes = [JSONRenderer]
    def post(self, request):
        artist_id = request.data.get('artist_id')
        if not artist_id:
            return Response({"error": "artist_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Fetch artist data using existing logic in apple_search
        data = artist_content(artist_id)
        if "error" in data:
            return Response(data, status=status.HTTP_404_NOT_FOUND)
        
        songs = data.get('top_songs_list', [])
        artist_name = data.get('artist_name')
        
        if not songs:
            return Response({"error": "No songs found for this artist"}, status=status.HTTP_400_BAD_REQUEST)
            
        bracket = BracketService.create_bracket(artist_id, artist_name, songs)
        serializer = BracketSerializer(bracket)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class BracketCreateFromArtistView(APIView):
    renderer_classes = [JSONRenderer]
    def get(self, request, artist_name):
        # Temporary mock data implementation with 64 items and 32 matchups
        items = [
            {
                "name": f"Mock Song {i}", 
                "seed": i, 
                "apple_id": f"s{i}", 
                "image_url": "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/96/51/57/96515710-cf91-0663-6f5a-942acf6ea31b/093624919797.jpg/300x300bb.jpg"
            }
            for i in range(1, 65)
        ]
        
        matchups = []
        for i in range(32):
            matchups.append({
                "round_number": 1,
                "matchup_number": i,
                "item1": items[i],
                "item2": items[63-i]
            })
        featured_albums = {
  "data": [
    {
      "id": "1099848709",
      "type": "albums",
      "href": "/v1/catalog/us/albums/1099848709",
      "attributes": {
        "artistName": "Deftones",
        "artwork": {
          "bgColor": "3a4784",
          "height": 1425,
          "textColor1": "dadff3",
          "textColor2": "bfc7ea",
          "textColor3": "bac0dd",
          "textColor4": "a4add5",
          "url": "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/96/51/57/96515710-cf91-0663-6f5a-942acf6ea31b/093624919797.jpg/{w}x{h}bb.jpg",
          "width": 1425
        },
        "contentRating": "explicit",
        "copyright": "℗ 2000 Maverick Recording Company",
        "editorialNotes": {
          "short": "An intoxicating brew of metal and shoegaze, euphoria and paranoia.",
          "standard": "Sacramento’s Deftones spent most of the ‘90s feverishly navigating the fringes of alt-metal. By 2000’s <i>White Pony</i>, they had effectively seized that scene, drowning its rage and recklessness in a moody, muddy stew of experimental metal, shoegaze, post-hardcore, and ambient noise. Opener “Back to School (Mini Maggit)”—a tidier rewriting of final track “Pink Maggit”—documents that takeover in radio-friendly format. Punctuated with adolescent angst, frontman Chino Moreno’s overblown raps bounce off the metallic squall as if ricocheting through locker-strewn hallways. But the rest of the album teases and torments within far more debaucherous environs, starting with the title itself, <i>White Pony</i>, a symbol of sex and a certain powdered stimulant. <br />\nLead single “Change (In the House of Flies)” speaks to the mania those corporeal pleasures can elicit—its menacing plod gives way to an explosive chorus, then a sinister request: “Give you the gun, blow me away,” Moreno chokes out at the bridge. It’s certainly not the only time he flirts with death. On “Digital Bath,” he daydreams about an electrocution, whispering seductively under the narcotic spell of a liquidy synth; on “Passenger,” he trades taunts with Tool’s Maynard James Keenan on a whiplashing ride that’s heading straight to either transcendence or hell. <br />\nGuitarist Stephen Carpenter plays the willing accomplice throughout, slipping between silvery, snaking licks and atonal riffs. Meanwhile, keyboardist Frank Delgado washes it all in ghostly drones and gurgling effects, capturing a mood that ripples between paranoia and euphoria. It all makes for an intoxicating brew, one that Moreno blissfully bathes in on “Knife Prty,” in which he confesses: “I could float here forever.”"
        },
        "genreNames": [
          "Hard Rock",
          "Music",
          "Rock",
          "Alternative",
          "Adult Alternative",
          "Metal"
        ],
        "isCompilation": False,
        "isComplete": True,
        "isMasteredForItunes": True,
        "isSingle": False,
        "name": "White Pony",
        "playParams": {
          "id": "1099848709",
          "kind": "album"
        },
        "recordLabel": "Maverick",
        "releaseDate": "2000-06-20",
        "trackCount": 12,
        "upc": "093624919797",
        "url": "https://music.apple.com/us/album/white-pony/1099848709"
      }
    },
    {
      "id": "1099843198",
      "type": "albums",
      "href": "/v1/catalog/us/albums/1099843198",
      "attributes": {
        "artistName": "Deftones",
        "artwork": {
          "bgColor": "050209",
          "height": 1425,
          "textColor1": "f0a98f",
          "textColor2": "e49982",
          "textColor3": "c18774",
          "textColor4": "b87b69",
          "url": "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/27/cb/b4/27cbb40e-f8c6-dede-9c69-62089a873fa9/093624919803.jpg/{w}x{h}bb.jpg",
          "width": 1425
        },
        "contentRating": "explicit",
        "copyright": "℗ 1997 Maverick Recording Company",
        "editorialNotes": {
          "short": "The alt-metal band’s second album charts their considerable growth.",
          "standard": "The massive, sludgy guitar stomp of opening track “My Own Summer (Shove It),” coupled with Chino Moreno’s whisper-to-a-scream vocals, launched Deftones to stardom. But the Sacramento band’s talent goes far beyond that breakthrough lead single. <i>Around the Fur</i> is a hydra-headed, alt-metal monster, with the explosive, rocketing “Dai the Flu” and the emotional fireworks of “Mascara” showcasing their diverse array of musical tricks. It’s a vein-bulging, blood-pumping assault of shredding guitars and hammering drums that knocks the wind right out of you."
        },
        "genreNames": [
          "Hard Rock",
          "Music",
          "Rock"
        ],
        "isCompilation": False,
        "isComplete": True,
        "isMasteredForItunes": True,
        "isSingle": False,
        "name": "Around the Fur",
        "playParams": {
          "id": "1099843198",
          "kind": "album"
        },
        "recordLabel": "Maverick",
        "releaseDate": "1997-10-28",
        "trackCount": 10,
        "upc": "093624919803",
        "url": "https://music.apple.com/us/album/around-the-fur/1099843198"
      }
    }
  ]
}
        mock_data = {
            "name": f"{artist_name.replace('-', ' ').title()} Madness (Mock)",
            "artist_name": artist_name.replace('-', ' ').title(),
            "artist_id": "mock_id_123",
            "featured_albums": featured_albums,
            "top_songs_list": items,
            "matchups": matchups
        }
        return Response(mock_data, status=status.HTTP_200_OK)

class BracketDetailView(APIView):
    renderer_classes = [JSONRenderer]
    def get(self, request, pk):
        try:
            bracket = Bracket.objects.prefetch_related('items', 'matchups__item1', 'matchups__item2', 'matchups__winner').get(pk=pk)
            serializer = BracketSerializer(bracket)
            return Response(serializer.data)
        except Bracket.DoesNotExist:
            return Response({"error": "Bracket not found"}, status=status.HTTP_404_NOT_FOUND)

class MatchupWinnerView(APIView):
    renderer_classes = [JSONRenderer]
    def post(self, request, pk):
        winner_id = request.data.get('winner_id')
        if not winner_id:
            return Response({"error": "winner_id is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            matchup = BracketService.advance_winner(pk, winner_id)
            serializer = MatchupSerializer(matchup)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
