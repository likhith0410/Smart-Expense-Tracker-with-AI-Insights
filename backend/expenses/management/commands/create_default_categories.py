# backend/expenses/management/commands/create_default_categories.py

# First create the directories:
# mkdir expenses/management
# mkdir expenses/management/commands
# Create __init__.py files in both directories

from django.core.management.base import BaseCommand
from expenses.models import Category

class Command(BaseCommand):
    help = 'Create default expense categories'

    def handle(self, *args, **options):
        categories = [
            {"name": "Food & Dining", "icon": "🍽️", "color": "#ef4444"},
            {"name": "Transportation", "icon": "🚗", "color": "#3b82f6"},
            {"name": "Shopping", "icon": "🛍️", "color": "#8b5cf6"},
            {"name": "Entertainment", "icon": "🎬", "color": "#f59e0b"},
            {"name": "Healthcare", "icon": "🏥", "color": "#10b981"},
            {"name": "Utilities", "icon": "⚡", "color": "#06b6d4"},
            {"name": "Education", "icon": "📚", "color": "#84cc16"},
            {"name": "Groceries", "icon": "🛒", "color": "#f97316"},
            {"name": "Fitness", "icon": "💪", "color": "#ec4899"},
            {"name": "Travel", "icon": "✈️", "color": "#14b8a6"},
            {"name": "Bills", "icon": "📄", "color": "#6366f1"},
            {"name": "Other", "icon": "💰", "color": "#64748b"},
        ]

        created_count = 0
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
                self.stdout.write(f'Category already exists: {category.name}')

        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {created_count} new categories')
        )