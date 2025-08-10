import Link from 'next/link';
import { Heart, Github, Twitter, Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Heart className="h-8 w-8 text-primary-400" />
              <span className="text-xl font-bold">X-Change</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              Change the world on X Layer. Support NGOs through yield staking.
              Keep your principal, fund impact. Built for OKX ETHCC Hackathon.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Globe className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Platform</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/discover" className="text-gray-400 hover:text-white transition-colors">
                  Discover NGOs
                </Link>
              </li>
              <li>
                <Link href="/portfolio" className="text-gray-400 hover:text-white transition-colors">
                  Portfolio
                </Link>
              </li>
              <li>
                <Link href="/register-ngo" className="text-gray-400 hover:text-white transition-colors">
                  Register NGO
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://www.oklink.com/xlayer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  X Layer Explorer
                </a>
              </li>
                              <li>
                  <a
                    href="https://xlayerrpc.okx.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    RPC Endpoin
                  </a>
                </li>
              <li>
                <Link href="/docs" className="text-gray-400 hover:text-white transition-colors">
                  Documentation
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2025 X-Change. Built for OKX ETHCC Hackathon. All contracts verified on X Layer Mainnet.
            </div>
            <div className="text-sm text-gray-400">
              <span className="inline-flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                X Layer Mainnet (Chain ID: 196)
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}