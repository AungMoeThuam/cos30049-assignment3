import { useNavigate } from "react-router"
import {
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Box,
  Paper,
  Link,
} from "@mui/material"

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <Box sx={{ width: "100%" }}>
      {/* Hero Section */}
      <Box 
        component="section" 
        sx={{ 
          textAlign: "center", 
          maxWidth: "768px", 
          mx: "auto", 
          mb: 8, 
          pt: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}
      >
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom 
          sx={{ 
            fontFamily: '"Manrope", sans-serif', 
            fontWeight: 800, 
            color: "slate.900",
            lineHeight: 1.2,
            mb: 3
          }}
        >
          AI-Powered Email Spam Detector
        </Typography>
        <Typography 
          variant="h6" 
          color="text.secondary" 
          sx={{ 
            fontFamily: '"Manrope", sans-serif', 
            fontWeight: 400, 
            mb: 4, 
            lineHeight: 1.6 
          }}
        >
          Secure your inbox with real-time spam prediction. Our platform uses advanced machine learning models to analyze copy-pasted text, file uploads, and CSV batches instantly.
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          size="large"
          onClick={() => navigate("/spam-check")}
          sx={{ 
            borderRadius: "8px", 
            px: 4, 
            py: 1.5,
            fontSize: "16px",
            fontFamily: '"Manrope", sans-serif',
            fontWeight: 600,
            textTransform: "none",
            boxShadow: 2,
            "&:hover": {
              bgcolor: "grey.800"
            }
          }}
        >
          Analyze Email
        </Button>
      </Box>

      {/* ML Models Section */}
      <Box component="section" sx={{ mb: 8 }}>
        <Typography 
          variant="h4" 
          component="h2" 
          gutterBottom 
          sx={{ 
            fontFamily: '"Manrope", sans-serif', 
            fontWeight: 700, 
            borderBottom: "1px solid", 
            borderColor: "divider", 
            pb: 1.5,
            mb: 4
          }}
        >
          Detection Models
        </Typography>
        <Grid container spacing={3}>
          {[
            {
              title: "Naive Bayes",
              desc: "Probabilistic model estimating word-occurrence spam likelihoods."
            },
            {
              title: "K-Means Clustering",
              desc: "Unsupervised model grouping similar emails based on centroid distances."
            },
            {
              title: "Logistic Regression",
              desc: "Linear classifier modeling spam probability using extracted numeric features."
            },
            {
              title: "Linear SVM",
              desc: "Support Vector Machine maximizing spacing between spam and safe bounds."
            }
          ].map((model) => (
            <Grid size={{ xs: 12, md: 6 }} key={model.title}>
              <Card 
                variant="outlined" 
                sx={{ 
                  borderRadius: "8px",
                  height: "100%",
                  transition: "background-color 0.2s",
                  "&:hover": {
                    bgcolor: "action.hover"
                  }
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Typography 
                    variant="h5" 
                    component="h3" 
                    gutterBottom 
                    sx={{ 
                      fontFamily: '"Manrope", sans-serif', 
                      fontWeight: 700,
                      mb: 1.5
                    }}
                  >
                    {model.title}
                  </Typography>
                  <Typography 
                    variant="body1" 
                    color="text.secondary" 
                    sx={{ 
                      fontFamily: '"Manrope", sans-serif',
                      lineHeight: 1.5
                    }}
                  >
                    {model.desc}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Feature Engineering Section */}
      <Box component="section" sx={{ mb: 8 }}>
        <Paper 
          variant="outlined" 
          sx={{ 
            p: 4, 
            bgcolor: "grey.50", 
            borderRadius: "8px", 
            borderColor: "divider" 
          }}
        >
          <Typography 
            variant="h4" 
            component="h2" 
            gutterBottom 
            sx={{ 
              fontFamily: '"Manrope", sans-serif', 
              fontWeight: 700,
              mb: 2
            }}
          >
            Feature Engineering Pipeline
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary" 
            sx={{ 
              fontFamily: '"Manrope", sans-serif', 
              mb: 4,
              maxWidth: "800px" 
            }}
          >
            Our sophisticated classification engine utilizes TF-IDF vectorization alongside 9 custom numeric features to accurately discern malicious intent.
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
            {[
              "URLs",
              "Exclamation Marks",
              "Question Marks",
              "Dollar Signs",
              "ALL CAPS",
              "Numeric Values",
              "Emojis",
              "Capital Ratio",
              "Word Count"
            ].map((feature) => (
              <Chip
                key={feature}
                label={feature}
                variant="outlined"
                sx={{
                  bgcolor: "background.paper",
                  borderColor: "divider",
                  fontFamily: '"Manrope", sans-serif',
                  fontWeight: 500,
                  fontSize: "13px",
                  px: 1,
                  py: 2
                }}
              />
            ))}
          </Box>
        </Paper>
      </Box>

      {/* About & Team Section */}
      <Box component="section">
        <Box
          id="about"
          sx={{
            mt: 5,
            mb: 3,
            textAlign: "center",
            scrollMarginTop: "88px",
          }}
        >
          <Typography
            variant="h4"
            component="h3"
            gutterBottom
            sx={{
              fontFamily: '"Manrope", sans-serif',
              fontWeight: 800,
              mb: 2,
            }}
          >
            About Spam Detector
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              fontFamily: '"Manrope", sans-serif',
              lineHeight: 1.7,
              maxWidth: "820px",
              mx: "auto",
              mb: 4,
            }}
          >
            This COS30049 full-stack machine learning application helps users inspect
            suspicious emails through a FastAPI prediction service and a responsive
            React dashboard. It supports pasted email text, single email files, and
            CSV batch analysis for practical spam and phishing triage.
            <br /><br />
            <strong>Training Dataset & Models:</strong> The AI models powering this detector were trained using the Scikit-Learn library. The core models evaluated include Naive Bayes, K-Means Clustering, Logistic Regression, and Linear SVM. 
            <br />
            <Box sx={{ mt: 2 }}>
              <Chip 
                label="Access our Training Dataset"
                component="a"
                href="https://liveswinburneeduau-my.sharepoint.com/:f:/g/personal/105292899_student_swin_edu_au/IgArWPNGyw_GTa-5LNHZSanxAT9Ok7633LuMn-NqIE9SUz0?e=axdxlL"
                target="_blank"
                rel="noopener noreferrer"
                color="primary"
                variant="outlined"
                clickable
                sx={{ fontWeight: "bold", fontFamily: '"Manrope", sans-serif' }}
              />
            </Box>
          </Typography>
        </Box>

        <Grid container spacing={3} sx={{ mb: 6 }}>
          {[
            {
              name: "Aung Moe Thu",
              role: "Leader",
              desc: "Responsible for model training, selection, and pipeline performance."
            },
            {
              name: "Kaung Htet Nyein",
              role: "Member",
              desc: "Responsible for the responsive React dashboard, theme, and interactive Heatmap."
            },
            {
              name: "Show Wai Yan",
              role: "Member",
              desc: "Responsible for API endpoints, file uploads, and CSV parsing."
            }
          ].map((member) => (
            <Grid size={{ xs: 12, md: 4 }} key={member.name}>
              <Card variant="outlined" sx={{ borderRadius: "8px", height: "100%" }}>
                <CardContent sx={{ p: 4, display: "flex", flexDirection: "column", height: "100%" }}>
                  <Typography 
                    variant="h5" 
                    component="h3" 
                    sx={{ 
                      fontFamily: '"Manrope", sans-serif', 
                      fontWeight: 700 
                    }}
                  >
                    {member.name}
                  </Typography>
                  <Typography 
                    variant="subtitle2" 
                    color="text.secondary" 
                    sx={{ 
                      fontFamily: '"Manrope", sans-serif', 
                      mb: 3, 
                      fontWeight: 500 
                    }}
                  >
                    {member.role}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      fontFamily: '"Manrope", sans-serif',
                      lineHeight: 1.6
                    }}
                  >
                    {member.desc}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            {
              title: "Frontend",
              desc: "React, Material UI, and D3 render validated input flows, model comparison bars, feature radar analysis, sentence heatmaps, and batch keyword summaries.",
            },
            {
              title: "Backend",
              desc: "FastAPI exposes POST and GET routes for single predictions, CSV processing, feature averages, and token-level sentence inspection.",
            },
            {
              title: "AI Integration",
              desc: "The service loads Assignment 2 model pipelines from backend/models and applies shared preprocessing, feature extraction, and probability postprocessing.",
            },
          ].map((item) => (
            <Grid size={{ xs: 12, md: 4 }} key={item.title}>
              <Card variant="outlined" sx={{ borderRadius: "8px", height: "100%" }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    variant="h6"
                    component="h4"
                    sx={{
                      fontFamily: '"Manrope", sans-serif',
                      fontWeight: 700,
                      mb: 1,
                    }}
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      fontFamily: '"Manrope", sans-serif',
                      lineHeight: 1.6,
                    }}
                  >
                    {item.desc}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: "8px",
            p: 3,
          }}
        >
          <Typography
            variant="h6"
            component="h4"
            sx={{
              fontFamily: '"Manrope", sans-serif',
              fontWeight: 700,
              mb: 2,
            }}
          >
            Implemented API Surface
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {[
              "GET /",
              "GET /api/v1/feature-averages",
              "POST /api/v1/predict",
              "POST /api/v1/predict/csv",
              "POST /api/v1/predict/sentence",
            ].map((endpoint) => (
              <Chip
                key={endpoint}
                label={endpoint}
                variant="outlined"
                sx={{
                  bgcolor: "grey.50",
                  borderColor: "divider",
                  borderRadius: "999px",
                  fontFamily: '"Manrope", sans-serif',
                  fontWeight: 600,
                }}
              />
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
