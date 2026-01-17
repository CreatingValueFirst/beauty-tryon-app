import 'package:flutter/material.dart';

class NailTryOnScreen extends StatelessWidget {
  const NailTryOnScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Nail Try-On')),
      body: const Center(child: Text('Nail Try-On Screen - Hand Tracking AR Here')),
    );
  }
}
