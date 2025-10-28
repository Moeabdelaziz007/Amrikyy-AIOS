import { render, screen, fireEvent } from '@testing-library/react';
// FIX: Added import for beforeEach
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ConfirmationDialog from './ConfirmationDialog