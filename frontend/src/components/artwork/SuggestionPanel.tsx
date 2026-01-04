import React from 'react';
import { Sparkles, X, Loader2, Check, Copy } from 'lucide-react';
import type { ArtworkSuggestion } from '../../../services/suggestionAPI';

interface SuggestionPanelProps {
  isOpen: boolean;
  onClose: () => void;
  suggestion: ArtworkSuggestion | null;
  loading: boolean;
  onApplySuggestion: (suggestion: ArtworkSuggestion) => void;
  appliedFields: Set<string>;
}

const SuggestionPanel: React.FC<SuggestionPanelProps> = ({
  isOpen,
  onClose,
  suggestion,
  loading,
  onApplySuggestion,
  appliedFields
}) => {
  if (!isOpen) return null;

  const handleApplyField = (field: string, value: any) => {
    const partialSuggestion = { ...suggestion, appliedField: field, appliedValue: value } as ArtworkSuggestion;
    onApplySuggestion(partialSuggestion);
  };

  const SuggestionField: React.FC<{
    label: string;
    value: any;
    field: string;
    icon?: React.ReactNode;
  }> = ({ label, value, field, icon }) => {
    const isApplied = appliedFields.has(field);
    
    return (
      <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            {icon}
            <span className="text-sm font-medium text-gray-700">{label}</span>
          </div>
          <button
            onClick={() => handleApplyField(field, value)}
            className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              isApplied
                ? 'bg-green-100 text-green-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
            disabled={isApplied}
          >
            {isApplied ? (
              <>
                <Check className="h-3 w-3" />
                Applied
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                Apply
              </>
            )}
          </button>
        </div>
        <div className="text-sm text-gray-900 mt-2">
          {Array.isArray(value) ? value.join(', ') : value}
        </div>
      </div>
    );
  };

  return (
    <>
      {}
      <div 
        className="fixed inset-0 bg-black bg-opacity-30 z-40 transition-opacity"
        onClick={onClose}
      />
      
      {}
      <div className="fixed right-0 top-0 h-full w-full md:w-[500px] bg-white shadow-2xl z-50 transform transition-transform">
        <div className="h-full flex flex-col">
          {}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-purple-600 to-blue-600">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-white" />
              <h2 className="text-xl font-semibold text-white">AI Suggestions</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
                <p className="text-gray-600 font-medium">Analyzing your artwork...</p>
                <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
              </div>
            ) : suggestion ? (
              <>
                {}
                {suggestion.imageUrl && (
                  <div className="rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={suggestion.imageUrl}
                      alt="Analyzed artwork"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}

                {}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-900">
                      AI Confidence Score
                    </span>
                    <span className="text-lg font-bold text-blue-600">
                      {(suggestion.confidenceScore * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${suggestion.confidenceScore * 100}%` }}
                    />
                  </div>
                </div>

                {}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Suggested Fields</h3>
                  
                  <SuggestionField
                    label="Title"
                    value={suggestion.suggestedTitle}
                    field="title"
                  />
                  
                  <SuggestionField
                    label="Category"
                    value={suggestion.suggestedCategory}
                    field="category"
                  />
                  
                  <SuggestionField
                    label="Medium"
                    value={suggestion.suggestedMedium}
                    field="medium"
                  />
                  
                  <SuggestionField
                    label="Description"
                    value={suggestion.suggestedDescription}
                    field="description"
                  />
                  
                  <SuggestionField
                    label="Tags"
                    value={suggestion.suggestedTags}
                    field="tags"
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <SuggestionField
                      label="Width (cm)"
                      value={suggestion.suggestedWidth}
                      field="width"
                    />
                    <SuggestionField
                      label="Height (cm)"
                      value={suggestion.suggestedHeight}
                      field="height"
                    />
                  </div>
                </div>

                {}
                {suggestion.metadata && (
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Advanced Analysis
                    </h3>
                    <div className="space-y-3">
                      {suggestion.metadata.artStyle && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">Art Style:</span>
                          <p className="text-sm text-gray-900 mt-1">
                            {suggestion.metadata.artStyle}
                          </p>
                        </div>
                      )}
                      {suggestion.metadata.mood && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">Mood:</span>
                          <p className="text-sm text-gray-900 mt-1">
                            {suggestion.metadata.mood}
                          </p>
                        </div>
                      )}
                      {suggestion.metadata.dominantColors && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">
                            Dominant Colors:
                          </span>
                          <p className="text-sm text-gray-900 mt-1">
                            {suggestion.metadata.dominantColors}
                          </p>
                        </div>
                      )}
                      {suggestion.metadata.subject && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">Subject:</span>
                          <p className="text-sm text-gray-900 mt-1">
                            {suggestion.metadata.subject}
                          </p>
                        </div>
                      )}
                      {suggestion.metadata.technicalQualities &&
                        suggestion.metadata.technicalQualities.length > 0 && (
                          <div>
                            <span className="text-sm font-medium text-gray-700">
                              Technical Qualities:
                            </span>
                            <ul className="list-disc list-inside text-sm text-gray-900 mt-1">
                              {suggestion.metadata.technicalQualities.map((quality: string, idx: number) => (
                                <li key={idx}>{quality}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                    </div>
                  </div>
                )}

                {}
                <div className="sticky bottom-0 bg-white pt-4 border-t border-gray-200">
                  <button
                    onClick={() => onApplySuggestion(suggestion)}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    <Sparkles className="h-5 w-5" />
                    Apply All Suggestions
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Sparkles className="h-12 w-12 mb-4 opacity-50" />
                <p>No suggestions yet</p>
                <p className="text-sm mt-2">Upload an image to get AI suggestions</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SuggestionPanel;
