import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ChevronLeft, ChevronRight, Check, Upload, ExternalLink, AlertCircle } from 'lucide-react';
import { NGO_REGISTRY, NGO_REGISTRY_ABI } from '../config/abis';
import { CAUSES, NGORegistrationData } from '../types';
import { getExplorerUrl } from '../config/contracts';

const RegisterNGO: NextPage = () => {
  const { address, isConnected } = useAccount();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const [formData, setFormData] = useState<NGORegistrationData>({
    name: '',
    description: '',
    website: '',
    logoURI: '',
    walletAddress: address || '0x0000000000000000000000000000000000000000',
    causes: [],
    metadataURI: '',
    coverImage: '',
    socialLinks: {
      twitter: '',
      facebook: '',
      linkedin: '',
      instagram: '',
    },
  });

  const { writeContract: registerNGO } = useWriteContract();
  const { isLoading: isTxLoading, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
    hash: txHash
  });

  const steps = [
    { id: 1, title: 'Basic Information', description: 'NGO details and contact info' },
    { id: 2, title: 'Branding & Identity', description: 'Logo, images, and social links' },
    { id: 3, title: 'Causes & Focus', description: 'Areas of impact and expertise' },
    { id: 4, title: 'Review & Submit', description: 'Confirm details and register' },
  ];

  const updateFormData = (field: keyof NGORegistrationData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateSocialLinks = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [platform]: value }
    }));
  };

  const handleCauseToggle = (cause: string) => {
    setFormData(prev => ({
      ...prev,
      causes: prev.causes.includes(cause)
        ? prev.causes.filter(c => c !== cause)
        : [...prev.causes, cause]
    }));
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return formData.name && formData.description.length >= 50 && formData.website && formData.walletAddress;
      case 2:
        return formData.logoURI;
      case 3:
        return formData.causes.length > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    if (!canProceedToNextStep() || !isConnected) return;

    setIsSubmitting(true);
    try {
      // Generate metadata URI (simplified - in production, upload to IPFS)
      const metadata = {
        name: formData.name,
        description: formData.description,
        website: formData.website,
        logoURI: formData.logoURI,
        coverImage: formData.coverImage,
        socialLinks: formData.socialLinks,
        registrationDate: Date.now(),
      };
      const metadataURI = `data:application/json;base64,${btoa(JSON.stringify(metadata))}`;

      const result = await registerNGO({
        address: NGO_REGISTRY,
        abi: NGO_REGISTRY_ABI,
        functionName: 'registerNGO',
        args: [
          formData.name,
          formData.description,
          formData.website,
          formData.logoURI,
          formData.walletAddress as `0x${string}`,
          formData.causes,
          metadataURI,
        ],
      });

      setTxHash(result);
    } catch (error) {
      console.error('Registration failed:', error);
      alert('Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isConnected) {
    return (
      <>
        <Head>
          <title>Register NGO - Connect Wallet</title>
        </Head>

        <div className="py-20">
          <div className="max-w-2xl mx-auto text-center px-4">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">Register Your NGO</h1>
            <p className="text-xl text-gray-600 mb-8">
              Connect your wallet to register your NGO and start receiving yield-based donations
            </p>
            <ConnectButton />
          </div>
        </div>
      </>
    );
  }

  if (isTxSuccess && txHash) {
    return (
      <>
        <Head>
          <title>Registration Successful</title>
        </Head>

        <div className="py-20">
          <div className="max-w-2xl mx-auto text-center px-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Registration Submitted!</h1>
            <p className="text-xl text-gray-600 mb-8">
              Your NGO registration has been submitted successfully. It will be reviewed and verified by our team.
            </p>

            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold mb-4">What happens next?</h3>
              <ul className="text-left space-y-2 text-gray-700">
                <li>• Your registration will be reviewed within 5-7 business days</li>
                <li>• You&apos;ll receive verification status updates via your connected wallet</li>
                <li>• Once verified, your NGO will be listed on the platform</li>
                <li>• Supporters can then start staking tokens to generate yield for your cause</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={getExplorerUrl('tx', txHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary inline-flex items-center justify-center"
              >
                View Transaction
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
              <Link href="/discover" className="btn-primary">
                Discover Other NGOs
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Register Your NGO - NGO Impact Platform</title>
        <meta name="description" content="Register your NGO to receive yield-based donations through token staking" />
      </Head>

      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Register Your NGO</h1>
            <p className="text-xl text-gray-600">
              Join our platform and start receiving yield-based donations
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep >= step.id
                      ? 'bg-primary-600 border-primary-600 text-white'
                      : 'border-gray-300 text-gray-500'
                  }`}>
                    {currentStep > step.id ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <span>{step.id}</span>
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-1 mx-2 ${
                      currentStep > step.id ? 'bg-primary-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center mt-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {steps[currentStep - 1].title}
              </h2>
              <p className="text-gray-600">{steps[currentStep - 1].description}</p>
            </div>
          </div>

          {/* Form Steps */}
          <div className="card p-8">
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    NGO Name *
                  </label>
                  <inpu
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter your NGO's official name"
                    value={formData.name}
                    onChange={(e) => updateFormData('name', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description * (minimum 50 characters)
                  </label>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Describe your NGO's mission, goals, and impact..."
                    value={formData.description}
                    onChange={(e) => updateFormData('description', e.target.value)}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.description.length}/50 characters minimum
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website URL *
                  </label>
                  <inpu
                    type="url"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="https://your-ngo-website.org"
                    value={formData.website}
                    onChange={(e) => updateFormData('website', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Wallet Address *
                  </label>
                  <inpu
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    value={formData.walletAddress}
                    readOnly
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    This is your connected wallet address where yield will be sen
                  </p>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logo URL *
                  </label>
                  <inpu
                    type="url"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="https://example.com/logo.png"
                    value={formData.logoURI}
                    onChange={(e) => updateFormData('logoURI', e.target.value)}
                  />
                  {formData.logoURI && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 mb-2">Preview:</p>
                      <img
                        src={formData.logoURI}
                        alt="NGO Logo"
                        className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                        onError={() => {
                          alert('Invalid image URL. Please check the URL and try again.');
                        }}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cover Image URL (Optional)
                  </label>
                  <inpu
                    type="url"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="https://example.com/cover.jpg"
                    value={formData.coverImage}
                    onChange={(e) => updateFormData('coverImage', e.target.value)}
                  />
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Social Media Links (Optional)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Twitter</label>
                      <inpu
                        type="url"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="https://twitter.com/your-ngo"
                        value={formData.socialLinks?.twitter || ''}
                        onChange={(e) => updateSocialLinks('twitter', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Facebook</label>
                      <inpu
                        type="url"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="https://facebook.com/your-ngo"
                        value={formData.socialLinks?.facebook || ''}
                        onChange={(e) => updateSocialLinks('facebook', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
                      <inpu
                        type="url"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="https://linkedin.com/company/your-ngo"
                        value={formData.socialLinks?.linkedin || ''}
                        onChange={(e) => updateSocialLinks('linkedin', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
                      <inpu
                        type="url"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="https://instagram.com/your-ngo"
                        value={formData.socialLinks?.instagram || ''}
                        onChange={(e) => updateSocialLinks('instagram', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Select Your Causes * (Select at least one)
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Choose the areas where your NGO focuses its efforts. This helps donors find and support causes they care about.
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {CAUSES.map((cause) => (
                      <label
                        key={cause}
                        className={`cursor-pointer p-3 rounded-lg border-2 transition-colors ${
                          formData.causes.includes(cause)
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        <inpu
                          type="checkbox"
                          className="sr-only"
                          checked={formData.causes.includes(cause)}
                          onChange={() => handleCauseToggle(cause)}
                        />
                        <div className="font-medium text-sm text-center">{cause}</div>
                      </label>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Selected: {formData.causes.length} cause{formData.causes.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h3 className="text-sm font-medium text-yellow-800 mb-1">Review Before Submitting</h3>
                      <p className="text-sm text-yellow-700">
                        Please review all information carefully. Your NGO will need to be verified before appearing on the platform.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Basic Information</h4>
                      <dl className="space-y-2 text-sm">
                        <div>
                          <dt className="text-gray-600">Name:</dt>
                          <dd className="font-medium">{formData.name}</dd>
                        </div>
                        <div>
                          <dt className="text-gray-600">Website:</dt>
                          <dd className="font-medium">{formData.website}</dd>
                        </div>
                        <div>
                          <dt className="text-gray-600">Wallet:</dt>
                          <dd className="font-medium font-mono text-xs">{formData.walletAddress}</dd>
                        </div>
                      </dl>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Causes & Focus</h4>
                      <div className="flex flex-wrap gap-1">
                        {formData.causes.map(cause => (
                          <span key={cause} className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
                            {cause}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {formData.description}
                    </p>
                  </div>

                  {formData.logoURI && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Logo</h4>
                      <img
                        src={formData.logoURI}
                        alt="NGO Logo"
                        className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
                className={`inline-flex items-center px-4 py-2 rounded-lg ${
                  currentStep === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </button>

              {currentStep < 4 ? (
                <button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  disabled={!canProceedToNextStep()}
                  className={`inline-flex items-center px-6 py-2 rounded-lg ${
                    canProceedToNextStep()
                      ? 'bg-primary-600 text-white hover:bg-primary-700'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Nex
                  <ChevronRight className="w-4 h-4 ml-2" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!canProceedToNextStep() || isSubmitting || isTxLoading}
                  className={`inline-flex items-center px-6 py-2 rounded-lg ${
                    canProceedToNextStep() && !isSubmitting && !isTxLoading
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting || isTxLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {isSubmitting ? 'Submitting...' : 'Confirming...'}
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Submit Registration
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterNGO;