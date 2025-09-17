import React, { useState, useMemo } from 'react';
import { 
  TextField, 
  Button, 
  Box, 
  Typography, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormHelperText,
  useTheme,
  SelectChangeEvent
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import BaseDialog, { BaseDialogProps } from './BaseDialog';

export interface CommentDialogProps extends Omit<BaseDialogProps, 'title' | 'children' | 'actions'> {
  title?: string;
  initialComment?: string;
  initialReason?: string;
  reasons?: string[];
  requireReason?: boolean;
  maxLength?: number;
  onSave: (comment: string, reason?: string) => Promise<void> | void;
  onClose?: () => void;
  saveButtonText?: string;
  cancelButtonText?: string;
  commentLabel?: string;
  reasonLabel?: string;
  commentPlaceholder?: string;
  showCharacterCount?: boolean;
}

const CommentDialog: React.FC<CommentDialogProps> = ({
  title,
  initialComment = '',
  initialReason = '',
  reasons = [],
  requireReason = false,
  maxLength = 500,
  onSave,
  onClose,
  saveButtonText,
  cancelButtonText,
  commentLabel,
  reasonLabel,
  commentPlaceholder,
  showCharacterCount = true,
  ...rest
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [comment, setComment] = useState(initialComment);
  const [reason, setReason] = useState(initialReason);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const characterCount = useMemo(() => comment.length, [comment]);
  const remainingCharacters = maxLength - characterCount;
  const isCommentValid = comment.trim().length > 0 && remainingCharacters >= 0;
  const isReasonValid = !requireReason || (requireReason && reason.trim().length > 0);
  const isFormValid = isCommentValid && isReasonValid;

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const newValue = e.target.value;
    if (maxLength && newValue.length > maxLength) return;
    setComment(newValue);
    
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleReasonChange = (e: SelectChangeEvent<string>) => {
    setReason(e.target.value);
    
    // Clear error when user selects a reason
    if (error) setError('');
  };

  const handleClose = () => {
    if (onClose) onClose();
    if (rest.onClose) rest.onClose({}, 'backdropClick');
  };

  const handleSubmit = async () => {
    if (!isFormValid) {
      setError(t('commentDialog.pleaseFillAllFields'));
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave(comment, reason || undefined);
      handleClose();
    } catch (err) {
      setError(t('commentDialog.saveFailed', { error: err instanceof Error ? err.message : '' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BaseDialog
      title={title || t('commentDialog.addComment')}
      {...rest}
      onClose={handleClose}
      actions={
        <Box sx={{ display: 'flex', gap: 2, width: '100%', justifyContent: 'flex-end' }}>
          <Button 
            onClick={handleClose} 
            disabled={isSubmitting}
            variant="outlined"
          >
            {cancelButtonText || t('common.cancel')}
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || !isFormValid}
            variant="contained"
            color="primary"
          >
            {isSubmitting ? t('common.saving') : (saveButtonText || t('common.save'))}
          </Button>
        </Box>
      }
    >
      <Box sx={{ p: 3 }}>
        {reasons.length > 0 && (
          <FormControl 
            fullWidth 
            margin="normal"
            error={!isReasonValid && requireReason}
            required={requireReason}
          >
            <InputLabel id="reason-label">
              {reasonLabel || t('commentDialog.reason')}
            </InputLabel>
            <Select
              labelId="reason-label"
              value={reason}
              onChange={handleReasonChange}
              label={reasonLabel || t('commentDialog.reason')}
              disabled={isSubmitting}
            >
              <MenuItem value="">
                <em>{t('commentDialog.selectReason')}</em>
              </MenuItem>
              {reasons.map((reasonOption) => (
                <MenuItem key={reasonOption} value={reasonOption}>
                  {reasonOption}
                </MenuItem>
              ))}
            </Select>
            {!isReasonValid && requireReason && (
              <FormHelperText>
                {t('commentDialog.reasonRequired')}
              </FormHelperText>
            )}
          </FormControl>
        )}

        <TextField
          fullWidth
          margin="normal"
          multiline
          rows={4}
          label={commentLabel || t('commentDialog.comment')}
          placeholder={commentPlaceholder || t('commentDialog.enterYourComment')}
          value={comment}
          onChange={handleCommentChange}
          disabled={isSubmitting}
          error={!isCommentValid && comment.length > 0}
          helperText={
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
              <span>
                {!isCommentValid && comment.length > 0 && (
                  <span style={{ color: theme.palette.error.main }}>
                    {t('commentDialog.commentTooLong', { maxLength })}
                  </span>
                )}
              </span>
              {showCharacterCount && (
                <span style={{ 
                  color: remainingCharacters < 0 
                    ? theme.palette.error.main 
                    : theme.palette.text.secondary 
                }}>
                  {remainingCharacters} {t('commentDialog.charactersRemaining')}
                </span>
              )}
            </Box>
          }
          inputProps={{
            maxLength: maxLength,
            'aria-label': commentLabel || t('commentDialog.comment'),
          }}
        />

        {error && (
          <Typography color="error" variant="body2" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}
      </Box>
    </BaseDialog>
  );
};

export default CommentDialog;
