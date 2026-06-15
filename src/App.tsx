import { useState } from 'react';
import Header from './components/Header';
import Stepper from './components/Stepper';
import AnimalProfile from './components/steps/AnimalProfile';
import Concentrate from './components/steps/Concentrate';
import Volumoso from './components/steps/Volumoso';
import FinalDiet from './components/steps/FinalDiet';
import NavigationButtons from './components/NavigationButtons';
import Report from './components/steps/Report';
import { FormulationState, Step } from './types';

const INITIAL_STATE: FormulationState = {
  name: '',
  category: '',
  subcategory: '',
  weight: '',
  quantity: 1,
  days: 1,
  concentrates: [],
  volumosos: []
}

export default function App() {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [formulationData, setFormulationData] = useState<FormulationState>(INITIAL_STATE);

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 5) as Step);
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1) as Step);

  const updateData = (data: Partial<FormulationState>) => {
    setFormulationData(prev => ({ ...prev, ...data }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-800 pb-12">
      <Header />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-8">
        <Stepper currentStep={currentStep} />
        
        <div className="mt-8">
          {currentStep === 1 && (
            <>
              <AnimalProfile data={formulationData} updateData={updateData} />
              <NavigationButtons onNext={nextStep} />
            </>
          )}
          {currentStep === 2 && (
            <>
              <Concentrate data={formulationData} updateData={updateData} />
              <NavigationButtons onNext={nextStep} onPrev={prevStep} />
            </>
          )}
          {currentStep === 3 && (
            <>
              <Volumoso data={formulationData} updateData={updateData} />
              <NavigationButtons onNext={nextStep} onPrev={prevStep} />
            </>
          )}
          {currentStep === 4 && (
            <>
              <FinalDiet data={formulationData} />
              <NavigationButtons onNext={nextStep} onPrev={prevStep} />
            </>
          )}
          {currentStep === 5 && (
            <>
              <Report data={formulationData} />
              <NavigationButtons onPrev={prevStep} isLast />
            </>
          )}
        </div>
      </main>
    </div>
  )
}
