import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../theme/app_theme.dart';

/// Home Screen
/// Main dashboard with quick access to all features

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;

  final List<Widget> _pages = const [
    _DashboardTab(),
    _GalleryTabPlaceholder(),
    _ProfileTabPlaceholder(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _pages[_selectedIndex],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _selectedIndex,
        onDestinationSelected: (index) {
          setState(() {
            _selectedIndex = index;
          });
        },
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home),
            label: 'Home',
          ),
          NavigationDestination(
            icon: Icon(Icons.photo_library_outlined),
            selectedIcon: Icon(Icons.photo_library),
            label: 'Gallery',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline),
            selectedIcon: Icon(Icons.person),
            label: 'Profile',
          ),
        ],
      ),
    );
  }
}

class _DashboardTab extends StatelessWidget {
  const _DashboardTab();

  @override
  Widget build(BuildContext context) {
    return CustomScrollView(
      slivers: [
        SliverAppBar.large(
          title: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Welcome Back!'),
              Text(
                'Try on amazing styles',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
            ],
          ),
          flexibleSpace: FlexibleSpaceBar(
            background: Container(
              decoration: BoxDecoration(
                gradient: AppTheme.brandGradient.scale(0.1),
              ),
            ),
          ),
        ),
        SliverPadding(
          padding: const EdgeInsets.all(16),
          sliver: SliverList(
            delegate: SliverChildListDelegate([
              // Quick Actions
              Row(
                children: [
                  Expanded(
                    child: _QuickActionCard(
                      title: 'Hair Styles',
                      icon: Icons.face_retouching_natural,
                      gradient: const LinearGradient(
                        colors: [Color(0xFF8B5CF6), Color(0xFFB794F6)],
                      ),
                      onTap: () => context.push('/hair'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _QuickActionCard(
                      title: 'Nail Designs',
                      icon: Icons.back_hand_outlined,
                      gradient: const LinearGradient(
                        colors: [Color(0xFFEC4899), Color(0xFFF472B6)],
                      ),
                      onTap: () => context.push('/nails'),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 24),

              // Recent Activity
              Text(
                'Recent Try-Ons',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 12),
              SizedBox(
                height: 200,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  itemCount: 5,
                  itemBuilder: (context, index) => _RecentItemCard(index: index),
                ),
              ),
              const SizedBox(height: 24),

              // Featured Styles
              Text(
                'Trending Styles',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 12),
              GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                  childAspectRatio: 0.8,
                ),
                itemCount: 4,
                itemBuilder: (context, index) => _TrendingStyleCard(index: index),
              ),
            ]),
          ),
        ),
      ],
    );
  }
}

class _QuickActionCard extends StatelessWidget {
  final String title;
  final IconData icon;
  final Gradient gradient;
  final VoidCallback onTap;

  const _QuickActionCard({
    required this.title,
    required this.icon,
    required this.gradient,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 120,
        decoration: BoxDecoration(
          gradient: gradient,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: gradient.colors.first.withOpacity(0.3),
              blurRadius: 12,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 48, color: Colors.white),
            const SizedBox(height: 8),
            Text(
              title,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _RecentItemCard extends StatelessWidget {
  final int index;

  const _RecentItemCard({required this.index});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 150,
      margin: const EdgeInsets.only(right: 12),
      decoration: BoxDecoration(
        color: Colors.grey[200],
        borderRadius: BorderRadius.circular(12),
      ),
      child: Center(
        child: Text('Recent #${index + 1}'),
      ),
    );
  }
}

class _TrendingStyleCard extends StatelessWidget {
  final int index;

  const _TrendingStyleCard({required this.index});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.grey[200],
        borderRadius: BorderRadius.circular(12),
      ),
      child: Center(
        child: Text('Trending #${index + 1}'),
      ),
    );
  }
}

class _GalleryTabPlaceholder extends StatelessWidget {
  const _GalleryTabPlaceholder();

  @override
  Widget build(BuildContext context) {
    return const Center(child: Text('Gallery Tab'));
  }
}

class _ProfileTabPlaceholder extends StatelessWidget {
  const _ProfileTabPlaceholder();

  @override
  Widget build(BuildContext context) {
    return const Center(child: Text('Profile Tab'));
  }
}
