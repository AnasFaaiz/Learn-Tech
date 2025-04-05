start cmd /k "cd frontend && npm run dev && cd .."
start cmd /k "
cd backend
if not exist venv (
    python -m venv venv
)
call venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py shell -c "from django.contrib.auth.models import User; User.objects.filter(username='admin').exists() or User.objects.create_superuser('admin', 'admin@example.com', 'admin')"
python manage.py runserver
cd ..
"