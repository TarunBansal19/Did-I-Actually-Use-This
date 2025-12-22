from tokenize import blank_re
from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL 

# Create your models here.
class Subscription(models.Model):
    CATEGORY_CHOICES = [
        ('entertainment' , 'Entertainment'),
        ('music' , 'Music'),
        ('tools' , 'Tools'),
        ('games' , 'Games'),
        ('education' , 'Education'),
        ('other' , 'Other'),
    ]
    BILLING_FREQUENCY_CHOICES = [
        ('monthly' , 'Monthly'),
        ('yearly' , 'Yearly'),
        ('one-time' , 'One-Time'),
        ('custom' , 'Custom'),
        ('trial' , 'Trial')
    ]

    user = models.ForeignKey(User , on_delete = models.CASCADE , related_name = 'subscriptions')
    name = models.CharField(max_length = 100)
    category = models.CharField(max_length = 20 , choices = CATEGORY_CHOICES)
    cost = models.DecimalField(max_digits = 10 , decimal_places = 2) #inr only 
    billing_frequency = models.CharField(max_length = 20 , choices = BILLING_FREQUENCY_CHOICES)
    renewal_date = models.DateField()
    cancel_url = models.URLField(blank = True , null = True)
    is_active = models.BooleanField(default = True)

    created_at = models.DateTimeField(auto_now_add = True)
    updated_at = models.DateTimeField(auto_now = True)

    def __str__(self):
        return f"{self.name} ({self.category})"
