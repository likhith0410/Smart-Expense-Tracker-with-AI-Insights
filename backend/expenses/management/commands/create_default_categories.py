# backend/expenses/management/commands/create_default_categories.py

from django.core.management.base import BaseCommand
from expenses.models import Category

class Command(BaseCommand):
    help = 'Create default expense categories'

    def handle(self, *args, **options):
        categories = [
            {'name': 'Food & Dining', 'icon': '🍽️', 'color': '#FF6B6B'},
            {'name': 'Transportation', 'icon': '🚗', 'color': '#4ECDC4'},
            {'name': 'Shopping', 'icon': '🛍️', 'color': '#45B7D1'},
            {'name': 'Entertainment', 'icon': '🎬', 'color': '#96CEB4'},
            {'name': 'Healthcare', 'icon': '🏥', 'color': '#FFEAA7'},
            {'name': 'Utilities', 'icon': '⚡', 'color': '#DDA0DD'},
            {'name': 'Education', 'icon': '📚', 'color': '#98D8C8'},
            {'name': 'Groceries', 'icon': '🛒', 'color': '#F7DC6F'},
            {'name': 'Fitness', 'icon': '💪', 'color': '#BB8FCE'},
            {'name': 'Travel', 'icon': '✈️', 'color': '#85C1E9'},
            {'name': 'Bills & Subscriptions', 'icon': '📄', 'color': '#F8C471'},
            {'name': 'Clothing', 'icon': '👕', 'color': '#82E0AA'},
            {'name': 'Electronics', 'icon': '📱', 'color': '#AED6F1'},
            {'name': 'Home & Garden', 'icon': '🏠', 'color': '#A9DFBF'},
            {'name': 'Gifts & Donations', 'icon': '🎁', 'color': '#F1948A'},
            {'name': 'Other', 'icon': '💰', 'color': '#D5DBDB'},
        ]

        created_count = 0
        updated_count = 0
        
        for cat_data in categories:
            category, created = Category.objects.get_or_create(
                name=cat_data["name"],
                defaults={
                    "icon": cat_data["icon"],
                    "color": cat_data["color"]
                }
            )
            
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created category: {category.name}')
                )
            else:
                # Update existing category with new icon/color if different
                updated = False
                if category.icon != cat_data["icon"]:
                    category.icon = cat_data["icon"]
                    updated = True
                if category.color != cat_data["color"]:
                    category.color = cat_data["color"]
                    updated = True
                
                if updated:
                    category.save()
                    updated_count += 1
                    self.stdout.write(
                        self.style.WARNING(f'Updated category: {category.name}')
                    )
                else:
                    self.stdout.write(f'Category already exists: {category.name}')

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created {created_count} new categories and updated {updated_count} existing categories'
            )
        )