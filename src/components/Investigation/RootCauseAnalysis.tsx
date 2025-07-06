import React, { useState } from 'react';
import { Brain, CheckCircle, X, Plus, Upload, Lightbulb, FileText, AlertCircle, User, Clock } from 'lucide-react';

interface RootCauseAnalysisProps {
  investigationId?: string;
}

interface RCAChecklist {
  id: string;
  category: string;
  question: string;
  response: boolean | null;
  comments: string;
  required: boolean;
}

interface AISuggestion {
  id: string;
  category: string;
  suggestion: string;
  confidence: number;
  reasoning: string;
}

interface ApprovalStep {
  id: string;
  role: string;
  approver: string;
  status: 'pending' | 'approved' | 'rejected';
  comments: string;
  timestamp: string;
  digitalSignature: string;
}

const mockAISuggestions: AISuggestion[] = [
  {
    id: '1',
    category: 'Equipment',
    suggestion: 'HPLC column degradation due to extended use beyond recommended lifecycle',
    confidence: 85,
    reasoning: 'Historical data shows similar OOS results when column usage exceeds 2000 injections. Current column at 2150 injections.'
  },
  {
    id: '2',
    category: 'Environmental',
    suggestion: 'Temperature fluctuation in sample storage affecting stability',
    confidence: 72,
    reasoning: 'Environmental monitoring data shows temperature spikes during the sample storage period.'
  },
  {
    id: '3',
    category: 'Human Error',
    suggestion: 'Incorrect sample preparation or dilution factor',
    confidence: 68,
    reasoning: 'Analyst training records show recent completion of refresher training, but manual calculation errors possible.'
  }
];

const mockChecklist: RCAChecklist[] = [
  {
    id: '1',
    category: 'Sample Integrity',
    question: 'Was the sample stored under appropriate conditions?',
    response: true,
    comments: 'Sample storage conditions verified within specification range.',
    required: true
  },
  {
    id: '2',
    category: 'Sample Integrity',
    question: 'Was the sample within its stability period?',
    response: true,
    comments: 'Sample tested within 24 hours of preparation.',
    required: true
  },
  {
    id: '3',
    category: 'Equipment',
    question: 'Was the instrument calibrated and qualified?',
    response: true,
    comments: 'HPLC system calibration current, last performed on 2024-01-10.',
    required: true
  },
  {
    id: '4',
    category: 'Equipment',
    question: 'Were system suitability criteria met?',
    response: false,
    comments: 'System suitability met but column performance declining. Back pressure increased 15%.',
    required: true
  },
  {
    id: '5',
    category: 'Method',
    question: 'Was the correct analytical method used?',
    response: true,
    comments: 'Method SOP-QC-001 v3.0 followed correctly.',
    required: true
  },
  {
    id: '6',
    category: 'Method',
    question: 'Were all method parameters followed correctly?',
    response: true,
    comments: 'All parameters verified and documented.',
    required: false
  },
  {
    id: '7',
    category: 'Personnel',
    question: 'Was the analyst trained and qualified for this method?',
    response: true,
    comments: 'Analyst training current, last refresher completed 2023-12-15.',
    required: true
  },
  {
    id: '8',
    category: 'Environment',
    question: 'Were environmental conditions within acceptable limits?',
    response: null,
    comments: '',
    required: false
  }
];

const mockApprovalFlow: ApprovalStep[] = [
  {
    id: 'APP-001',
    role: 'Lab Analyst',
    approver: 'John Doe',
    status: 'approved',
    comments: 'RCA completed. Root cause identified as HPLC column degradation.',
    timestamp: '2024-01-16T16:30:00Z',
    digitalSignature: 'DS-JD-20240116-1630'
  },
  {
    id: 'APP-002',
    role: 'Lab Supervisor',
    approver: 'Sarah Wilson',
    status: 'pending',
    comments: '',
    timestamp: '',
    digitalSignature: ''
  },
  {
    id: 'APP-003',
    role: 'QA Manager',
    approver: 'Mike Johnson',
    status: 'pending',
    comments: '',
    timestamp: '',
    digitalSignature: ''
  }
];

export function RootCauseAnalysis({ investigationId }: RootCauseAnalysisProps) {
  const [checklist, setChecklist] = useState<RCAChecklist[]>(mockChecklist);
  const [manualAnalysis, setManualAnalysis] = useState('Based on the systematic evaluation, the primary root cause has been identified as HPLC column degradation. The column has exceeded its recommended lifecycle of 2000 injections, currently at 2150 injections. This degradation has resulted in decreased separation efficiency and peak shape deterioration, leading to the observed OOS result.');
  const [rootCause, setRootCause] = useState('HPLC column degradation due to usage beyond recommended lifecycle (2150 injections vs. 2000 limit)');
  const [contributingFactors, setContributingFactors] = useState<string[]>([
    'Lack of automated column usage tracking system',
    'Manual record keeping leading to oversight of column lifecycle',
    'Absence of proactive column replacement schedule'
  ]);
  const [newFactor, setNewFactor] = useState('');
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>(['1']);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [approvalFlow, setApprovalFlow] = useState<ApprovalStep[]>(mockApprovalFlow);
  const [approvalComment, setApprovalComment] = useState('');

  const updateChecklistItem = (id: string, field: 'response' | 'comments', value: boolean | string) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const addContributingFactor = () => {
    if (newFactor.trim()) {
      setContributingFactors(prev => [...prev, newFactor.trim()]);
      setNewFactor('');
    }
  };

  const removeContributingFactor = (index: number) => {
    setContributingFactors(prev => prev.filter((_, i) => i !== index));
  };

  const toggleSuggestion = (suggestionId: string) => {
    setSelectedSuggestions(prev => 
      prev.includes(suggestionId) 
        ? prev.filter(id => id !== suggestionId)
        : [...prev, suggestionId]
    );
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const getCompletionPercentage = () => {
    const requiredItems = checklist.filter(item => item.required);
    const completedRequired = requiredItems.filter(item => item.response !== null);
    return Math.round((completedRequired.length / requiredItems.length) * 100);
  };

  const approveStep = (stepId: string) => {
    setApprovalFlow(prev => prev.map(step => 
      step.id === stepId ? {
        ...step,
        status: 'approved',
        comments: approvalComment,
        timestamp: new Date().toISOString(),
        digitalSignature: `DS-${step.approver.replace(' ', '')}-${new Date().toISOString().slice(0, 10)}`
      } : step
    ));
    setApprovalComment('');
  };

  const rejectStep = (stepId: string) => {
    setApprovalFlow(prev => prev.map(step => 
      step.id === stepId ? {
        ...step,
        status: 'rejected',
        comments: approvalComment,
        timestamp: new Date().toISOString(),
        digitalSignature: `DS-${step.approver.replace(' ', '')}-${new Date().toISOString().slice(0, 10)}`
      } : step
    ));
    setApprovalComment('');
  };

  const groupedChecklist = checklist.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, RCAChecklist[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-600 rounded-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Root Cause Analysis</h2>
              <p className="text-sm text-gray-600">
                {investigationId ? `Investigation ID: ${investigationId}` : 'Comprehensive root cause investigation'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Completion</div>
            <div className="text-2xl font-bold text-purple-600">{getCompletionPercentage()}%</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Suggestions */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <Lightbulb className="h-5 w-5 text-yellow-600" />
                <h3 className="text-lg font-semibold text-gray-900">AI Suggestions</h3>
              </div>
              <p className="text-sm text-gray-600 mt-1">AI-generated potential root causes based on historical data</p>
            </div>
            <div className="p-4 space-y-4">
              {mockAISuggestions.map((suggestion) => (
                <div key={suggestion.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedSuggestions.includes(suggestion.id)}
                        onChange={() => toggleSuggestion(suggestion.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs font-medium text-gray-500 uppercase">{suggestion.category}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className={`w-2 h-2 rounded-full ${
                        suggestion.confidence >= 80 ? 'bg-green-500' : 
                        suggestion.confidence >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      <span className="text-xs text-gray-500">{suggestion.confidence}%</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-900 mb-2">{suggestion.suggestion}</p>
                  <p className="text-xs text-gray-600">{suggestion.reasoning}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Approval Workflow */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Approval Workflow</h3>
              </div>
            </div>
            <div className="p-4 space-y-4">
              {approvalFlow.map((step, index) => (
                <div key={step.id} className="relative">
                  {index < approvalFlow.length - 1 && (
                    <div className="absolute left-4 top-8 w-0.5 h-16 bg-gray-200"></div>
                  )}
                  <div className="flex items-start space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step.status === 'approved' ? 'bg-green-100 text-green-600' :
                      step.status === 'rejected' ? 'bg-red-100 text-red-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {step.status === 'approved' ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : step.status === 'rejected' ? (
                        <X className="h-4 w-4" />
                      ) : (
                        <Clock className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{step.role}</p>
                          <p className="text-xs text-gray-600">{step.approver}</p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          step.status === 'approved' ? 'bg-green-100 text-green-800' :
                          step.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {step.status.toUpperCase()}
                        </span>
                      </div>
                      {step.status === 'approved' && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-600">{step.comments}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(step.timestamp).toLocaleString()}
                          </p>
                          <p className="text-xs text-blue-600 mt-1">
                            Signature: {step.digitalSignature}
                          </p>
                        </div>
                      )}
                      {step.status === 'pending' && index === approvalFlow.findIndex(s => s.status === 'pending') && (
                        <div className="mt-2">
                          <textarea
                            value={approvalComment}
                            onChange={(e) => setApprovalComment(e.target.value)}
                            placeholder="Add approval comments..."
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                            rows={2}
                          />
                          <div className="flex space-x-2 mt-2">
                            <button
                              onClick={() => approveStep(step.id)}
                              className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => rejectStep(step.id)}
                              className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Analysis */}
        <div className="lg:col-span-2 space-y-6">
          {/* MHRA Checklist */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">MHRA Investigation Checklist</h3>
              <p className="text-sm text-gray-600 mt-1">Systematic evaluation of potential causes</p>
            </div>
            <div className="p-4">
              {Object.entries(groupedChecklist).map(([category, items]) => (
                <div key={category} className="mb-6">
                  <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    {category}
                  </h4>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-start space-x-3">
                          <div className="flex items-center space-x-2 mt-1">
                            {item.required && (
                              <AlertCircle className="h-4 w-4 text-red-500" />
                            )}
                            <div className="flex space-x-2">
                              <button
                                onClick={() => updateChecklistItem(item.id, 'response', true)}
                                className={`px-3 py-1 rounded text-xs font-medium ${
                                  item.response === true 
                                    ? 'bg-green-100 text-green-800 border border-green-300' 
                                    : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-green-50'
                                }`}
                              >
                                Yes
                              </button>
                              <button
                                onClick={() => updateChecklistItem(item.id, 'response', false)}
                                className={`px-3 py-1 rounded text-xs font-medium ${
                                  item.response === false 
                                    ? 'bg-red-100 text-red-800 border border-red-300' 
                                    : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-red-50'
                                }`}
                              >
                                No
                              </button>
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 mb-2">{item.question}</p>
                            <textarea
                              value={item.comments}
                              onChange={(e) => updateChecklistItem(item.id, 'comments', e.target.value)}
                              placeholder="Add comments or evidence..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              rows={2}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Manual Analysis */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Manual Analysis</h3>
              <p className="text-sm text-gray-600 mt-1">Additional investigation findings and analysis</p>
            </div>
            <div className="p-4">
              <textarea
                value={manualAnalysis}
                onChange={(e) => setManualAnalysis(e.target.value)}
                placeholder="Describe your detailed analysis, observations, and findings..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={6}
              />
            </div>
          </div>

          {/* Root Cause Conclusion */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Root Cause Conclusion</h3>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Root Cause *
                </label>
                <textarea
                  value={rootCause}
                  onChange={(e) => setRootCause(e.target.value)}
                  placeholder="State the primary root cause based on your investigation..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contributing Factors
                </label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={newFactor}
                    onChange={(e) => setNewFactor(e.target.value)}
                    placeholder="Add contributing factor..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && addContributingFactor()}
                  />
                  <button
                    onClick={addContributingFactor}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                {contributingFactors.length > 0 && (
                  <div className="space-y-2">
                    {contributingFactors.map((factor, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm text-gray-700">{factor}</span>
                        <button
                          onClick={() => removeContributingFactor(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Evidence Files */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Supporting Evidence</h3>
            </div>
            <div className="p-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-2">
                    <label className="cursor-pointer">
                      <span className="text-sm text-blue-600 hover:text-blue-500">
                        Upload evidence files
                      </span>
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xlsx"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Documents, images, data files up to 10MB each
                    </p>
                  </div>
                </div>
                
                {attachments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-700">{file.name}</span>
                        </div>
                        <button
                          onClick={() => removeAttachment(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
              Save Draft
            </button>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700">
              Complete RCA
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}