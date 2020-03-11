import { Box, Button, FormControlLabel, Snackbar, Switch, TextField } from '@material-ui/core';
import { grey } from '@material-ui/core/colors';
import Alert from '@material-ui/lab/Alert';
import React from 'react';
import 'react-day-picker/lib/style.css';
import styled from 'styled-components';

type Props = {
    isIncludePrivateEvent: boolean;
    isIncludeAllDayEvent: boolean;
    isPostMarkdown: boolean;
    templateText: string;
    openAlert: boolean;
    handleChangeFilterSettingSwitch: (name: string) => (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleChangePostMarkdownSwitch: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleChangeText: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleSaveBtnClicked: () => void;
    handleCloseAlert: (event?: React.SyntheticEvent, reason?: string) => void;
};

export const Setting: React.FC<Props> = (props: Props) => {
    const {
        isIncludePrivateEvent,
        isIncludeAllDayEvent,
        isPostMarkdown,
        templateText,
        openAlert,
        handleChangeFilterSettingSwitch,
        handleChangePostMarkdownSwitch,
        handleChangeText,
        handleSaveBtnClicked,
        handleCloseAlert,
    } = props;

    return (
        <>
            <FilterSettingFrame>
                <FormControlLabel
                    control={
                        <Switch
                            checked={isIncludePrivateEvent}
                            onChange={handleChangeFilterSettingSwitch('isIncludePrivateEvent')}
                            value="PrivateEventFilter"
                            color="primary"
                        />
                    }
                    labelPlacement="end"
                    label="非公開予定を含む"
                />
                <FormControlLabel
                    control={
                        <Switch
                            checked={isIncludeAllDayEvent}
                            onChange={handleChangeFilterSettingSwitch('isIncludeAllDayEvent')}
                            value="AllDayEventFilter"
                            color="primary"
                        />
                    }
                    labelPlacement="end"
                    label="終日予定を含む"
                />
                <FormControlLabel
                    control={
                        <Switch
                            checked={isPostMarkdown}
                            onChange={handleChangePostMarkdownSwitch}
                            value="PostMarkdown"
                            color="secondary"
                        />
                    }
                    labelPlacement="end"
                    label="Markdownで投稿する"
                />
            </FilterSettingFrame>
            <TemplateTextField
                className="template-multiline-text"
                label="テンプレート"
                multiline
                rows="12"
                defaultValue={templateText}
                variant="outlined"
                onChange={handleChangeText}
            />
            <Box mt={1.5} mr={7} mb={0} ml={7}>
                <SuccessButton onClick={handleSaveBtnClicked} variant="contained" color="primary" disableElevation>
                    設定を保存する
                </SuccessButton>
            </Box>
            <Snackbar open={openAlert} autoHideDuration={1500} onClose={handleCloseAlert}>
                <Alert onClose={handleCloseAlert} variant="filled" severity="success">
                    設定を保存しました
                </Alert>
            </Snackbar>
        </>
    );
};

const FilterSettingFrame = styled(Box)`
    border: 1px solid ${grey[400]};
    border-radius: 5px;
    padding: 16px;
    position: relative;
    margin: 8px 0 24px 0;

    &:hover {
        border-color: ${grey[900]};
    }

    &::before {
        color: ${grey[700]};
        background-color: ${grey[50]};
        content: 'オプション設定';
        font-size: 12px;
        position: absolute;
        padding: 4px 4px;
        top: -14px;
        left: 8px;
    }
`;

const TemplateTextField = styled(TextField)`
    width: 100%;
`;

const SuccessButton = styled(Button)`
    width: 100%;
`;
