import 'package:flutter/material.dart';

class HairTryOnScreen extends StatelessWidget {
  const HairTryOnScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Hair Try-On')),
      body: const Center(child: Text('Hair Try-On Screen - Camera AR Integration Here')),
    );
  }
}
