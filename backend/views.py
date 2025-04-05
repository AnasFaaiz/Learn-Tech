from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
import os
from django.conf import settings

@api_view(['POST'])
@parser_classes([MultiPartParser])
def update_profile_image(request):
    try:
        if 'profileImage' not in request.FILES:
            return Response({'error': 'No image file provided'}, status=400)

        image = request.FILES['profileImage']
        
        # Create uploads directory if it doesn't exist
        upload_dir = os.path.join(settings.MEDIA_ROOT, 'profile_images')
        os.makedirs(upload_dir, exist_ok=True)
        
        # Save the file
        file_path = os.path.join(upload_dir, f'profile_{request.user.id}_{image.name}')
        with open(file_path, 'wb+') as destination:
            for chunk in image.chunks():
                destination.write(chunk)
                
        # Generate URL for the saved image
        image_url = f'/media/profile_images/profile_{request.user.id}_{image.name}'
        
        return Response({'imageUrl': image_url})
        
    except Exception as e:
        print('Profile image upload error:', str(e))
        return Response({'error': str(e)}, status=500)