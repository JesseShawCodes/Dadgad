from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.renderers import JSONRenderer

class SessionHandshakeView(APIView):
    renderer_classes = [JSONRenderer]

    def get(self, request):
        # Ensure session exists (Django creates it on access)
        if not request.session.session_key:
            request.session.create()
        
        return Response({"sessionId": request.session.session_key})
